export interface Registration {
  id: string
  registrationId: string
  registrationDate: string
  createdOn: string
  registrationNumber: string
  studentName: string
  branchName: string
  studentId: string
  courseName: string
  registrationBy: string
  studentEmail: string
  surname: string
  commencementDate: string
}

export interface RegistrationDetails {
  registration: RegistrationObject
  createBy: CreateBy
  branch: Branch
  course: Course
}

export interface RegistrationObject {
  id: string
  registrationNumber: number
  branchId: string
  student: Student
  createdOn: string
  createdBy: string
  registrationDate: string
  courseId: string
  outstandingAmount: number
  paidAmount: number
  status: number
  recieptReference: string
  commencementDate: string
}

export interface Student {
  id: string
  name: string
  surname: string
  idNumber: string
  idDocument: string
  passportNumber: string
  emailAddress: string
  cellPhone: string
  address: Address
  createdOn: string
}

export interface Address {
  id: string
  streetName: string
  line1: string
  line2: string
  city: string
  postalCode: string
}

export interface CreateBy {
  id: string
  name: string
  email: string
  role: any
  branchId: string
}

export interface Branch {
  id: string
  name: string
  description: string
  price: number
  createdOn: string
  isEnabled?: boolean
}

export interface Course {
  id: string
  branchId: string
  name: string
  description: string
  courseDuration: string
  createdOn: string
  price: number
}
