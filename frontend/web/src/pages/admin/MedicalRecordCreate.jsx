import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import MedicalRecordForm from '../../components/forms/MedicalRecordForm';

import {
    useAddMedicalRecordMutation,
} from '../../features/api/medicalApi';


export default function MedicalRecordCreate() {
    const navigate = useNavigate();

    const [
        addMedicalRecord,
        {
            isLoading,
            error,
        },
    ] = useAddMedicalRecordMutation();

    const [localError, setLocalError] = useState(null);

    async function submit(data) {
        setLocalError(null);

        try {
            await addMedicalRecord(data).unwrap();

            navigate('/admin/medical');
        } catch (err) {
            setLocalError(err);
        }
    }

    return (
        <div className="mx-auto w-full max-w-4xl space-y-4 sm:space-y-6">
            <div>
                <h2 className="font-serif text-2xl font-bold text-saddle-brown">
                    Add Medical Record
                </h2>

                <p className="mt-1 text-sm text-charcoal/70">
                    Add a medical event to an animal's history.
                </p>
            </div>

            <MedicalRecordForm
                mode="create"
                onSubmit={submit}
                isLoading={isLoading}
                submitError={localError || error}
            />
        </div>
    );
}