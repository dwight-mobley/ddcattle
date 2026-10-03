import React, { useState } from 'react';
import {
    Link,
    useNavigate,
    useParams,
} from 'react-router-dom';

import MedicalRecordForm from '../../components/forms/MedicalRecordForm';

import {
    useGetMedicalRecordByIdQuery,
    useUpdateMedicalRecordMutation,
} from '../../features/api/medicalApi';


export default function MedicalRecordEdit() {
    const { id } = useParams();
    const navigate = useNavigate();

    const {
        data: record,
        isLoading: isLoadingRecord,
        isError,
        error: loadError,
    } = useGetMedicalRecordByIdQuery(id);

    const [
        updateMedicalRecord,
        {
            isLoading: isUpdating,
            error: updateError,
        },
    ] = useUpdateMedicalRecordMutation();

    const [localError, setLocalError] = useState(null);

    async function submit(data) {
        setLocalError(null);

        try {
            await updateMedicalRecord({
                id,
                ...data,
            }).unwrap();

            navigate('/admin/medical');
        } catch (err) {
            setLocalError(err);
        }
    }

    if (isLoadingRecord) {
        return (
            <div className="rounded-[var(--radius-xl)] border border-saddle-brown/10 bg-white p-6 text-sm text-charcoal/70 shadow-sm">
                Loading medical record...
            </div>
        );
    }

    if (isError || !record) {
        return (
            <div className="space-y-4">
                <div
                    role="alert"
                    className="rounded-[var(--radius-xl)] border border-rust/20 bg-rust/10 p-4 text-sm text-rust"
                >
                    Unable to load this medical record.
                    {loadError?.status && (
                        <> Error {loadError.status}.</>
                    )}
                </div>

                <Link
                    to="/admin/medical"
                    className="inline-flex min-h-11 items-center rounded-lg border border-saddle-brown/20 bg-white px-5 py-2 text-sm font-medium text-saddle-brown hover:bg-sage/10"
                >
                    Back to Medical Records
                </Link>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-4xl space-y-4 sm:space-y-6">
            <div>
                <h2 className="font-serif text-2xl font-bold text-saddle-brown">
                    Edit Medical Record
                </h2>

                <p className="mt-1 text-sm text-charcoal/70">
                    {record.animal_name}
                    {' · '}
                    {record.title}
                </p>
            </div>

            <MedicalRecordForm
                key={record.id}
                mode="edit"
                initialData={record}
                onSubmit={submit}
                isLoading={isUpdating}
                submitError={
                    localError || updateError
                }
            />
        </div>
    );
}