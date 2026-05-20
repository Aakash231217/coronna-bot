import { BUSINESS_DETAILS_FORM } from '@/constants/forms'
import React from 'react'
import { FieldErrors, FieldValues, UseFormRegister } from 'react-hook-form'
import FormGenerator from '../form-generator'

type Props = {
  register: UseFormRegister<FieldValues>
  errors: FieldErrors<FieldValues>
}

function BusinessDetailsForm({ errors, register }: Props) {
  return (
    <>
      <h2 className="text-gravel md:text-4xl font-bold">Tell us about your business</h2>
      <p className="text-iridium md:text-sm">
        We use these details to set up your workspace, billing and support
        contact. You can edit them later in settings.
      </p>
      {BUSINESS_DETAILS_FORM.map((field) => (
        <FormGenerator
          key={field.id}
          {...field}
          errors={errors}
          register={register}
          name={field.name}
        />
      ))}
    </>
  )
}

export default BusinessDetailsForm
