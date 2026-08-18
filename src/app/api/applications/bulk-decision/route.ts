import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { generateAdmissionLetterPdf } from '@/lib/pdf';

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== 'admissions_officer' && user.role !== 'admin' && user.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Unauthorized. Admissions officer or admin privileges required.' }, { status: 401 });
    }

    const body = await req.json();
    const { applicationIds, decision, notes } = body;

    if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
      return NextResponse.json({ error: 'applicationIds array is required and must not be empty.' }, { status: 400 });
    }

    if (!decision || !['approve', 'reject'].includes(decision)) {
      return NextResponse.json({ error: 'Valid decision ("approve" or "reject") is required.' }, { status: 400 });
    }

    // Fetch all targeted applications
    const applications = await prisma.application.findMany({
      where: {
        id: { in: applicationIds },
      },
      include: {
        user: true,
        programme: true,
      },
    });

    if (applications.length === 0) {
      return NextResponse.json({ error: 'No matching applications found.' }, { status: 404 });
    }

    const currentYear = new Date().getFullYear();
    const reportingDate = '2026-09-07';
    const results: Array<{ id: string; status: string; applicantName: string; serialNumber?: string; error?: string }> = [];

    // Pre-calculate program serial offsets to avoid race conditions
    const programmeCounts: Record<string, number> = {};
    if (decision === 'approve') {
      const distinctProgCodes = Array.from(new Set(applications.map((a) => a.programme.code)));
      for (const code of distinctProgCodes) {
        const count = await prisma.admissionLetter.count({
          where: {
            serialNumber: {
              contains: `BORABU/${currentYear}/${code}/`,
            },
          },
        });
        programmeCounts[code] = count;
      }
    }

    for (const app of applications) {
      try {
        if (app.status !== 'submitted') {
          results.push({
            id: app.id,
            applicantName: app.user.fullName,
            status: app.status,
            error: `Skipped: Application is in '${app.status}' status (must be 'submitted').`,
          });
          continue;
        }

        if (decision === 'reject') {
          const reviewReason = notes?.trim() || 'Application rejected by admissions registry panel during batch review.';
          await prisma.$transaction(async (tx) => {
            await tx.application.update({
              where: { id: app.id },
              data: {
                status: 'rejected',
                reviewedById: user.id,
                reviewedAt: new Date(),
                reviewNotes: reviewReason,
              },
            });

            await tx.auditLog.create({
              data: {
                actorId: user.id,
                action: 'bulk_reject_application',
                entity: 'Application',
                entityId: app.id,
              },
            });

            await tx.notification.create({
              data: {
                userId: app.userId,
                channel: 'email',
                subject: 'Application Status Update - Borabu Teachers Training College',
                message: `Dear ${app.user.fullName}, We regret to inform you that your application for ${
                  app.programme.name
                } was not successful. Panel note: ${reviewReason}`,
                status: 'sent',
              },
            });
          });

          results.push({
            id: app.id,
            applicantName: app.user.fullName,
            status: 'rejected',
          });
        } else if (decision === 'approve') {
          const courseCode = app.programme.code;
          programmeCounts[courseCode] = (programmeCounts[courseCode] || 0) + 1;
          const serialNumber = `BORABU/${currentYear}/${courseCode}/${String(programmeCounts[courseCode]).padStart(5, '0')}`;

          const fees = JSON.parse(app.programme.feesStructure || '[]');
          const pdfUrl = await generateAdmissionLetterPdf(serialNumber, {
            applicantName: app.user.fullName,
            email: app.user.email,
            phone: app.user.phone,
            kcseIndexNo: app.kcseIndexNo,
            kcseMeanGrade: app.kcseMeanGrade,
            programmeName: app.programme.name,
            programmeCode: app.programme.code,
            reportingDate,
            feesSummary: fees.slice(0, 2),
          });

          const approveReason = notes?.trim() || 'Approved during batch admissions verification.';

          await prisma.$transaction(async (tx) => {
            await tx.admissionLetter.create({
              data: {
                applicationId: app.id,
                serialNumber,
                pdfUrl,
                reportingDate,
                generatedById: user.id,
              },
            });

            await tx.application.update({
              where: { id: app.id },
              data: {
                status: 'letter_issued',
                reviewedById: user.id,
                reviewedAt: new Date(),
                reviewNotes: approveReason,
              },
            });

            await tx.auditLog.create({
              data: {
                actorId: user.id,
                action: 'bulk_approve_application',
                entity: 'Application',
                entityId: app.id,
              },
            });

            await tx.notification.create({
              data: {
                userId: app.userId,
                channel: 'email',
                subject: 'Admission Offer - Borabu Teachers Training College',
                message: `Dear ${app.user.fullName}, Congratulations! Your application for ${
                  app.programme.name
                } has been approved. Your official admission letter (Serial: ${serialNumber}) has been generated. You can download the PDF from your portal dashboard.`,
                status: 'sent',
              },
            });
          });

          results.push({
            id: app.id,
            applicantName: app.user.fullName,
            status: 'letter_issued',
            serialNumber,
          });
        }
      } catch (itemErr: any) {
        console.error(`Error processing application ${app.id} in bulk:`, itemErr);
        results.push({
          id: app.id,
          applicantName: app.user.fullName,
          status: 'error',
          error: itemErr?.message || 'Failed to process decision.',
        });
      }
    }

    const successCount = results.filter((r) => r.status === (decision === 'approve' ? 'letter_issued' : 'rejected')).length;
    const failedCount = results.length - successCount;

    return NextResponse.json({
      message: `Bulk ${decision} completed: ${successCount} processed successfully, ${failedCount} failed/skipped.`,
      decision,
      totalRequested: applicationIds.length,
      successCount,
      failedCount,
      results,
    });
  } catch (error: any) {
    console.error('Bulk decision route error:', error);
    return NextResponse.json(
      { error: 'Internal server error during bulk decision processing.' },
      { status: 500 }
    );
  }
}
