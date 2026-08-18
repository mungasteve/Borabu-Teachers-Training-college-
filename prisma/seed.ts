import { prisma } from '../src/lib/db';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Clearing database tables...');
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.admissionLetter.deleteMany();
  await prisma.document.deleteMany();
  await prisma.application.deleteMany();
  await prisma.user.deleteMany();
  await prisma.programme.deleteMany();

  console.log('Seeding Borabu Teachers Training College programmes...');

  const programmesData = [
    {
      name: 'Diploma in Primary Teacher Education (DPTE)',
      code: 'DPTE',
      level: 'Diploma',
      duration: '3 Years (9 Terms)',
      intakeCapacity: 250,
      intakePeriod: 'September / May',
      isActive: true,
      minGradeRequirement: JSON.stringify({
        meanGrade: 'C',
        subjects: {
          english: 'C',
          kiswahili: 'C',
          mathematics: 'C',
        },
      }),
      feesStructure: JSON.stringify([
        { semester: 'Year 1 Term 1', tuition: 18500, boarding: 12000, activity: 2500, total: 33000 },
        { semester: 'Year 1 Term 2', tuition: 16500, boarding: 12000, activity: 1000, total: 29500 },
        { semester: 'Year 1 Term 3', tuition: 16500, boarding: 12000, activity: 1000, total: 29500 },
        { semester: 'Year 2 Term 1 (Teaching Practice 1)', tuition: 18500, boarding: 12000, activity: 3500, total: 34000 },
        { semester: 'Year 2 Term 2', tuition: 16500, boarding: 12000, activity: 1000, total: 29500 },
        { semester: 'Year 2 Term 3 (Teaching Practice 2)', tuition: 18500, boarding: 12000, activity: 3500, total: 34000 },
        { semester: 'Year 3 Term 1', tuition: 18500, boarding: 12000, activity: 2000, total: 32500 },
        { semester: 'Year 3 Term 2 (Final Practicum)', tuition: 18500, boarding: 12000, activity: 3500, total: 34000 },
        { semester: 'Year 3 Term 3 (KNEC Assessments)', tuition: 16500, boarding: 12000, activity: 2500, total: 31000 },
      ]),
    },
    {
      name: 'Diploma in Early Childhood Teacher Education (DECTE)',
      code: 'DECTE',
      level: 'Diploma',
      duration: '3 Years (9 Terms)',
      intakeCapacity: 160,
      intakePeriod: 'September / May',
      isActive: true,
      minGradeRequirement: JSON.stringify({
        meanGrade: 'C',
        subjects: {
          english: 'C',
          mathematics: 'D+',
        },
      }),
      feesStructure: JSON.stringify([
        { semester: 'Year 1 Term 1', tuition: 17500, boarding: 12000, activity: 2500, total: 32000 },
        { semester: 'Year 1 Term 2', tuition: 15500, boarding: 12000, activity: 1000, total: 28500 },
        { semester: 'Year 1 Term 3', tuition: 15500, boarding: 12000, activity: 1000, total: 28500 },
        { semester: 'Year 2 Term 1 (Practicum 1)', tuition: 17500, boarding: 12000, activity: 3000, total: 32500 },
        { semester: 'Year 2 Term 2', tuition: 15500, boarding: 12000, activity: 1000, total: 28500 },
        { semester: 'Year 2 Term 3 (Practicum 2)', tuition: 17500, boarding: 12000, activity: 3000, total: 32500 },
        { semester: 'Year 3 Term 1', tuition: 17500, boarding: 12000, activity: 1500, total: 31000 },
        { semester: 'Year 3 Term 2 (Final Practicum)', tuition: 17500, boarding: 12000, activity: 3000, total: 32500 },
        { semester: 'Year 3 Term 3 (KNEC Exam)', tuition: 15500, boarding: 12000, activity: 2000, total: 29500 },
      ]),
    },
    {
      name: 'Upgrade Diploma in Primary Teacher Education (UDPTE)',
      code: 'UDPTE',
      level: 'Diploma Upgrade',
      duration: '1 Year (4 Terms / School Holidays & Distance)',
      intakeCapacity: 200,
      intakePeriod: 'April / August / December',
      isActive: true,
      minGradeRequirement: JSON.stringify({
        meanGrade: 'P1 Certificate',
        subjects: {},
      }),
      feesStructure: JSON.stringify([
        { semester: 'Term 1 (Holiday Module)', tuition: 16000, boarding: 6000, activity: 1500, total: 23500 },
        { semester: 'Term 2 (Holiday Module)', tuition: 16000, boarding: 6000, activity: 1000, total: 23000 },
        { semester: 'Term 3 (Teaching Practicum)', tuition: 18000, boarding: 6000, activity: 2500, total: 26500 },
        { semester: 'Term 4 (KNEC Evaluation)', tuition: 16000, boarding: 6000, activity: 1500, total: 23500 },
      ]),
    },
    {
      name: 'Upgrade Diploma in Early Childhood Teacher Education (UDECTE)',
      code: 'UDECTE',
      level: 'Diploma Upgrade',
      duration: '1 Year (4 Terms / School Holidays & Distance)',
      intakeCapacity: 150,
      intakePeriod: 'April / August / December',
      isActive: true,
      minGradeRequirement: JSON.stringify({
        meanGrade: 'ECDE Certificate',
        subjects: {},
      }),
      feesStructure: JSON.stringify([
        { semester: 'Term 1 (Holiday Module)', tuition: 15000, boarding: 6000, activity: 1500, total: 22500 },
        { semester: 'Term 2 (Holiday Module)', tuition: 15000, boarding: 6000, activity: 1000, total: 22000 },
        { semester: 'Term 3 (Teaching Practicum)', tuition: 17000, boarding: 6000, activity: 2500, total: 25500 },
        { semester: 'Term 4 (KNEC Evaluation)', tuition: 15000, boarding: 6000, activity: 1500, total: 22500 },
      ]),
    },
    {
      name: 'Diploma in Secondary Teacher Education (DSTE - Junior School)',
      code: 'DSTE',
      level: 'Diploma',
      duration: '3 Years (9 Terms)',
      intakeCapacity: 180,
      intakePeriod: 'September / January',
      isActive: true,
      minGradeRequirement: JSON.stringify({
        meanGrade: 'C+',
        subjects: {
          subject1: 'C+',
          subject2: 'C+',
        },
      }),
      feesStructure: JSON.stringify([
        { semester: 'Year 1 Term 1', tuition: 19500, boarding: 12000, activity: 2500, total: 34000 },
        { semester: 'Year 1 Term 2', tuition: 17500, boarding: 12000, activity: 1000, total: 30500 },
        { semester: 'Year 1 Term 3', tuition: 17500, boarding: 12000, activity: 1000, total: 30500 },
        { semester: 'Year 2 Term 1 (TP Practicum 1)', tuition: 19500, boarding: 12000, activity: 3500, total: 35000 },
        { semester: 'Year 2 Term 2', tuition: 17500, boarding: 12000, activity: 1000, total: 30500 },
        { semester: 'Year 2 Term 3 (TP Practicum 2)', tuition: 19500, boarding: 12000, activity: 3500, total: 35000 },
        { semester: 'Year 3 Term 1', tuition: 19500, boarding: 12000, activity: 2000, total: 33500 },
        { semester: 'Year 3 Term 2 (Final Practicum)', tuition: 19500, boarding: 12000, activity: 3500, total: 35000 },
        { semester: 'Year 3 Term 3 (KNEC Exams)', tuition: 17500, boarding: 12000, activity: 2500, total: 32000 },
      ]),
    },
    {
      name: 'Diploma in Special Needs Education (SNE - Primary/Inclusive Option)',
      code: 'SNE',
      level: 'Diploma',
      duration: '2 Years (6 Terms)',
      intakeCapacity: 120,
      intakePeriod: 'September / January',
      isActive: true,
      minGradeRequirement: JSON.stringify({
        meanGrade: 'C',
        subjects: {
          english: 'C',
        },
      }),
      feesStructure: JSON.stringify([
        { semester: 'Year 1 Term 1', tuition: 18000, boarding: 12000, activity: 2500, total: 32500 },
        { semester: 'Year 1 Term 2', tuition: 16000, boarding: 12000, activity: 1000, total: 29000 },
        { semester: 'Year 1 Term 3', tuition: 16000, boarding: 12000, activity: 1000, total: 29000 },
        { semester: 'Year 2 Term 1 (Special School Practicum)', tuition: 19000, boarding: 12000, activity: 3500, total: 34500 },
        { semester: 'Year 2 Term 2', tuition: 16000, boarding: 12000, activity: 1000, total: 29000 },
        { semester: 'Year 2 Term 3 (Final Assessment)', tuition: 16000, boarding: 12000, activity: 2500, total: 30500 },
      ]),
    },
    {
      name: 'Certificate in Early Childhood Development Education (ECDE)',
      code: 'CECDE',
      level: 'Certificate',
      duration: '2 Years (6 Terms)',
      intakeCapacity: 140,
      intakePeriod: 'September / January / May',
      isActive: true,
      minGradeRequirement: JSON.stringify({
        meanGrade: 'D+',
        subjects: {
          english: 'D+',
        },
      }),
      feesStructure: JSON.stringify([
        { semester: 'Year 1 Term 1', tuition: 14000, boarding: 11000, activity: 2000, total: 27000 },
        { semester: 'Year 1 Term 2', tuition: 12500, boarding: 11000, activity: 1000, total: 24500 },
        { semester: 'Year 1 Term 3', tuition: 12500, boarding: 11000, activity: 1000, total: 24500 },
        { semester: 'Year 2 Term 1 (Teaching Practicum)', tuition: 15000, boarding: 11000, activity: 2500, total: 28500 },
        { semester: 'Year 2 Term 2', tuition: 12500, boarding: 11000, activity: 1000, total: 24500 },
        { semester: 'Year 2 Term 3 (KNEC Exam)', tuition: 12500, boarding: 11000, activity: 2000, total: 25500 },
      ]),
    },
    {
      name: 'Proficiency Certificate in CBC Pedagogical Approaches & Digital Literacy',
      code: 'CBC-PDL',
      level: 'Short Course',
      duration: '3 Months (Continuous / Weekends)',
      intakeCapacity: 100,
      intakePeriod: 'Monthly Intake',
      isActive: true,
      minGradeRequirement: JSON.stringify({
        meanGrade: 'Open / Practicing Teacher',
        subjects: {},
      }),
      feesStructure: JSON.stringify([
        { semester: 'Module 1: CBC Rubrics & Formative Assessment', tuition: 8000, boarding: 0, activity: 1000, total: 9000 },
        { semester: 'Module 2: Educational Digital Tools & Interactive Media', tuition: 8000, boarding: 0, activity: 1000, total: 9000 },
      ]),
    },
    {
      name: 'Certificate in Educational Leadership, Management & School Governance',
      code: 'CELM',
      level: 'Short Course',
      duration: '6 Months (School Holidays)',
      intakeCapacity: 80,
      intakePeriod: 'April & August Holidays',
      isActive: true,
      minGradeRequirement: JSON.stringify({
        meanGrade: 'Certificate/Diploma/Degree in Education',
        subjects: {},
      }),
      feesStructure: JSON.stringify([
        { semester: 'Term 1: Strategic Planning & Financial Governance', tuition: 12000, boarding: 5000, activity: 1000, total: 18000 },
        { semester: 'Term 2: Staff Appraisal (TPAD) & CBC Leadership', tuition: 12000, boarding: 5000, activity: 1000, total: 18000 },
      ]),
    },
    {
      name: 'Certificate in Guidance, Counseling & Child Protection in Schools',
      code: 'CGCP',
      level: 'Short Course',
      duration: '6 Months',
      intakeCapacity: 80,
      intakePeriod: 'April & August Holidays',
      isActive: true,
      minGradeRequirement: JSON.stringify({
        meanGrade: 'D+',
        subjects: {},
      }),
      feesStructure: JSON.stringify([
        { semester: 'Term 1: Adolescent Psychology & Crisis Counseling', tuition: 11000, boarding: 5000, activity: 1000, total: 17000 },
        { semester: 'Term 2: Child Rights, Safety & Case Management', tuition: 11000, boarding: 5000, activity: 1000, total: 17000 },
      ]),
    },
  ];

  for (const prog of programmesData) {
    await prisma.programme.create({ data: prog });
  }

  // Fetch some seeded courses for applicant assignments
  const allProgs = await prisma.programme.findMany();
  const dpteProg = allProgs.find((p) => p.code === 'DPTE')!;
  const decteProg = allProgs.find((p) => p.code === 'DECTE')!;
  const dsteProg = allProgs.find((p) => p.code === 'DSTE')!;

  console.log('Seeding users...');
  const salt = bcrypt.genSaltSync(10);
  const adminPasswordHash = bcrypt.hashSync('Admin@1234', salt);
  const officerPasswordHash = bcrypt.hashSync('Officer@1234', salt);
  const studentPasswordHash = bcrypt.hashSync('Student@1234', salt);

  const superAdmin = await prisma.user.create({
    data: {
      fullName: 'Super Admin',
      email: 'superadmin@borabuttc.ac.ke',
      phone: '+254711223344',
      passwordHash: adminPasswordHash,
      role: 'super_admin',
      isVerified: true,
    },
  });

  const officer = await prisma.user.create({
    data: {
      fullName: 'Nancy Kemunto (Admissions Registrar)',
      email: 'officer@borabuttc.ac.ke',
      phone: '+254722334455',
      passwordHash: officerPasswordHash,
      role: 'admissions_officer',
      isVerified: true,
    },
  });

  const applicant1 = await prisma.user.create({
    data: {
      fullName: 'Kevin Omwamba',
      email: 'student@gmail.com',
      phone: '+254733445566',
      passwordHash: studentPasswordHash,
      role: 'applicant',
      isVerified: true,
      mailingAddress: 'P.O. Box 45, Nyansiongo',
      kinName: 'Peter Omwamba',
      kinPhone: '+254799887766',
      kinRelation: 'Father',
    },
  });

  const applicant2 = await prisma.user.create({
    data: {
      fullName: 'John Momanyi',
      email: 'john.momanyi@gmail.com',
      phone: '+254744556677',
      passwordHash: studentPasswordHash,
      role: 'applicant',
      isVerified: true,
      mailingAddress: 'P.O. Box 92, Keroka',
      kinName: 'Mary Momanyi',
      kinPhone: '+254788776655',
      kinRelation: 'Mother',
    },
  });

  const applicant3 = await prisma.user.create({
    data: {
      fullName: 'Jane Moraa',
      email: 'jane.moraa@gmail.com',
      phone: '+254755667788',
      passwordHash: studentPasswordHash,
      role: 'applicant',
      isVerified: true,
      mailingAddress: 'P.O. Box 12, Chepilat',
      kinName: 'Samuel Moraa',
      kinPhone: '+254777665544',
      kinRelation: 'Guardian',
    },
  });

  console.log('Seeding applications...');
  // 1. Fresh Draft application for Kevin -> DPTE (boxes left completely blank)
  await prisma.application.create({
    data: {
      userId: applicant1.id,
      programmeId: dpteProg.id,
      status: 'draft',
      personalDetails: JSON.stringify({}),
      kcseIndexNo: '',
      kcseYear: 0,
      kcseMeanGrade: '',
      subjectGrades: JSON.stringify({}),
    },
  });

  // 2. Submitted application for John -> DECTE (Eligibility Passed)
  const appJohn = await prisma.application.create({
    data: {
      userId: applicant2.id,
      programmeId: decteProg.id,
      status: 'submitted',
      personalDetails: JSON.stringify({
        dob: '2004-10-20',
        gender: 'Male',
        idNumber: '39223344',
        county: 'Kisii',
        subCounty: 'Masaba South',
        address: 'P.O. Box 92, Keroka',
        nextOfKinName: 'Mary Momanyi',
        nextOfKinPhone: '+254788776655',
        nextOfKinRelation: 'Mother',
      }),
      kcseIndexNo: '40711202005',
      kcseYear: 2023,
      kcseMeanGrade: 'C',
      subjectGrades: JSON.stringify({
        english: 'C',
        kiswahili: 'C+',
        mathematics: 'D+',
        biology: 'C',
        cre: 'B',
      }),
      eligibilityResult: JSON.stringify({
        eligible: true,
        programme: 'DECTE',
        checks: [
          { rule: 'Minimum KCSE Mean Grade of C (Plain)', passed: true, detail: 'Applicant Mean Grade is C' },
          { rule: 'English grade C or above', passed: true, detail: 'Grade C' },
          { rule: 'Mathematics grade D+ or above', passed: true, detail: 'Grade D+' },
        ],
        message: 'You provisionally meet the minimum entry requirements for Diploma in Early Childhood Teacher Education (DECTE). Final admission is subject to verification of your certificates.',
      }),
      submittedAt: new Date(),
    },
  });

  await prisma.document.createMany({
    data: [
      { applicationId: appJohn.id, type: 'id_copy', fileName: 'national_id.pdf', fileUrl: '/uploads/mock_id.pdf', verified: false },
      { applicationId: appJohn.id, type: 'kcse_cert', fileName: 'kcse_slip.pdf', fileUrl: '/uploads/mock_kcse.pdf', verified: false },
      { applicationId: appJohn.id, type: 'photo', fileName: 'passport_photo.png', fileUrl: '/uploads/mock_photo.png', verified: false },
    ],
  });

  // 3. Admitted application for Jane -> DPTE (Admission Letter Issued)
  const appJane = await prisma.application.create({
    data: {
      userId: applicant3.id,
      programmeId: dpteProg.id,
      status: 'letter_issued',
      personalDetails: JSON.stringify({
        dob: '2005-02-12',
        gender: 'Female',
        idNumber: '41122334',
        county: 'Nyamira',
        subCounty: 'Borabu',
        address: 'P.O. Box 12, Chepilat',
        nextOfKinName: 'Samuel Moraa',
        nextOfKinPhone: '+254777665544',
        nextOfKinRelation: 'Guardian',
      }),
      kcseIndexNo: '40732101015',
      kcseYear: 2024,
      kcseMeanGrade: 'C+',
      subjectGrades: JSON.stringify({
        english: 'B-',
        kiswahili: 'C+',
        mathematics: 'C',
        chemistry: 'C',
        cre: 'A-',
      }),
      eligibilityResult: JSON.stringify({
        eligible: true,
        programme: 'DPTE',
        checks: [
          { rule: 'Minimum KCSE Mean Grade of C (Plain)', passed: true, detail: 'Applicant Mean Grade is C+' },
          { rule: 'English grade C or above', passed: true, detail: 'Grade B-' },
          { rule: 'Kiswahili grade C or above', passed: true, detail: 'Grade C+' },
          { rule: 'Mathematics grade C or above', passed: true, detail: 'Grade C' },
        ],
        message: 'You provisionally meet the minimum entry requirements. Final admission is subject to verification of your certificates.',
      }),
      submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      reviewedById: officer.id,
      reviewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      reviewNotes: 'Academic credentials verified. Approved for Diploma in Primary Teacher Education (DPTE) admission.',
    },
  });

  await prisma.document.createMany({
    data: [
      { applicationId: appJane.id, type: 'id_copy', fileName: 'jane_id.pdf', fileUrl: '/uploads/mock_id.pdf', verified: true },
      { applicationId: appJane.id, type: 'kcse_cert', fileName: 'jane_kcse.pdf', fileUrl: '/uploads/mock_kcse.pdf', verified: true },
      { applicationId: appJane.id, type: 'photo', fileName: 'jane_photo.png', fileUrl: '/uploads/mock_photo.png', verified: true },
    ],
  });

  const serial = 'BTTC/2026/DPTE/00001';
  await prisma.admissionLetter.create({
    data: {
      applicationId: appJane.id,
      serialNumber: serial,
      pdfUrl: `/api/letters/download/${serial}`,
      reportingDate: '2026-09-07',
      generatedById: officer.id,
      issuedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.notification.create({
    data: {
      userId: applicant3.id,
      channel: 'email',
      subject: 'Official Admission Letter Issued - Borabu Teachers Training College',
      message: `Dear Jane Moraa, Congratulations! Your application for the Diploma in Primary Teacher Education (DPTE) has been approved. Your admission letter serial number is ${serial}. You can download your official letter from your trainee portal.`,
      status: 'sent',
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: officer.id,
      action: 'approve_application',
      entity: 'Application',
      entityId: appJane.id,
    },
  });

  console.log('Borabu TTC Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
