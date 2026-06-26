import HorseForm from '@/components/Admin/HorseForm'
import AdminLayout from '@/components/layout/AdminLayout'
import React from 'react'
import {type Horse} from '@/types'

function EditHorse({horse}:{horse: Horse}) {

  return (
    <div>
        <HorseForm horse={horse} />
    </div>
  )
}

export default EditHorse

EditHorse.layout = (page: React.ReactNode)=><AdminLayout>{page}</AdminLayout>