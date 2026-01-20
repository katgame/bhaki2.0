export interface Branch {
  id: string
  name: string
  description: string
  price: number
  createdOn: string
  isEnabled?: boolean
}


export interface BranchRequest {
  name?: string
  description?: string
}
