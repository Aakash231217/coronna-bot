type UserRegistrationProps = {
  id: string
  type: 'email' | 'text' | 'password'
  inputType: 'select' | 'input'
  options?: { value: string; label: string; id: string }[]
  label?: string
  placeholder: string
  name: string
}

export const USER_REGISTRATION_FORM: UserRegistrationProps[] = [
  {
    id: '1',
    inputType: 'input',
    placeholder: 'Full name',
    name: 'fullname',
    type: 'text',
  },
  {
    id: '2',
    inputType: 'input',
    placeholder: 'Email',
    name: 'email',
    type: 'email',
  },
  {
    id: '3',
    inputType: 'input',
    placeholder: 'Confirm Email',
    name: 'confirmEmail',
    type: 'email',
  },
  {
    id: '4',
    inputType: 'input',
    placeholder: 'Password',
    name: 'password',
    type: 'password',
  },
  {
    id: '5',
    inputType: 'input',
    placeholder: 'Confrim Password',
    name: 'confirmPassword',
    type: 'password',
  },
]

export const BUSINESS_DETAILS_FORM: UserRegistrationProps[] = [
  {
    id: 'b1',
    inputType: 'input',
    placeholder: 'Company name',
    name: 'companyName',
    type: 'text',
  },
  {
    id: 'b2',
    inputType: 'input',
    placeholder: 'Business email',
    name: 'businessEmail',
    type: 'email',
  },
  {
    id: 'b3',
    inputType: 'input',
    placeholder: 'Phone number',
    name: 'phone',
    type: 'text',
  },
  {
    id: 'b4',
    inputType: 'input',
    placeholder: 'Website (optional)',
    name: 'website',
    type: 'text',
  },
]

export const USER_LOGIN_FORM: UserRegistrationProps[] = [
  {
    id: '1',
    inputType: 'input',
    placeholder: 'Enter your email',
    name: 'email',
    type: 'email',
  },
  {
    id: '2',
    inputType: 'input',
    placeholder: 'Password',
    name: 'password',
    type: 'password',
  },
]
