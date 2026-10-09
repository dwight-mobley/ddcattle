import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useGetReminderOptionsQuery } from '../../features/api/reminderApi';
import { useGetAnimalsQuery } from '../../features/api/animalApi';

import {
    animalId,
    bulkReminderPayload,
    errorText,
    recurrenceUnits,
    reminderPayload,
    rowsOf,
} from '../admin/reminderUtils';

import {
    ErrorMessage,
    Field,
    inputClasses,
    primaryClasses,
    secondaryClasses,
} from '../admin/ReminderFields';


export default function ReminderForm({
    initialData = {},
    onSubmit,
    isLoading = false,
    mode = 'edit',
}) {
    const navigate = useNavigate();

    const {
        data,
        isLoading: animalsLoading,
        isError: animalsError,
        refetch,
    } = useGetAnimalsQuery();

    const { data: metadata } = useGetReminderOptionsQuery();

    const recordTypes =
        metadata?.actions?.POST?.medical?.children?.record_type?.choices || [];

    const animals = rowsOf(data);

    const isCreate = mode === 'create';

    const lock = useRef(false);

    const [error, setError] = useState('');

    const [appliesTo, setAppliesTo] = useState(
        isCreate ? 'animals' : 'single'
    );

    const [animalSearch, setAnimalSearch] = useState('');

    const [form, setForm] = useState(() => ({
        title: initialData.title || '',
        reminder_type: initialData.reminder_type || 'general',
        description: initialData.description || '',

        animal: animalId(initialData.animal) ?? '',
        animals: [],

        due_date:
            initialData.due_date?.slice(0, 10) || '',

        due_time:
            initialData.due_time?.slice(0, 5) || '',

        active:
            initialData.active ?? true,

        recurring:
            initialData.recurring ?? false,

        recurrence_interval:
            initialData.recurrence_interval ?? 1,

        recurrence_unit:
            initialData.recurrence_unit || 'months',

        medical_enabled:
            Boolean(initialData.medical),

        record_type:
            initialData.medical?.record_type || '',

        create_record_on_completion:
            initialData.medical?.create_record_on_completion ?? true,
    }));


    const change = ({ target }) => {
        setForm(current => ({
            ...current,
            [target.name]:
                target.type === 'checkbox'
                    ? target.checked
                    : target.value,
        }));
    };


    const input = (
        name,
        type = 'text',
        extra = {}
    ) => (
        <input
            name={name}
            type={type}
            value={form[name]}
            onChange={change}
            className={inputClasses}
            {...extra}
        />
    );


    const check = (name, label) => (
        <label className="flex min-h-11 sm:min-h-0 items-center gap-3 sm:gap-2 text-sm text-charcoal">
            <input
                type="checkbox"
                name={name}
                checked={form[name]}
                onChange={change}
                className="h-5 w-5 shrink-0 sm:h-4 sm:w-4 accent-saddle-brown"
            />
            {label}
        </label>
    );


    const filteredAnimals = useMemo(() => {
        const search = animalSearch
            .trim()
            .toLowerCase();

        if (!search) {
            return animals;
        }

        return animals.filter(animal =>
            animal.name
                ?.toLowerCase()
                .includes(search)
        );
    }, [animals, animalSearch]);


    function toggleAnimal(id) {
        const value = Number(id);

        setForm(current => {
            const selected = current.animals.includes(value);

            return {
                ...current,
                animals: selected
                    ? current.animals.filter(
                        animalId => animalId !== value
                    )
                    : [...current.animals, value],
            };
        });
    }


    function selectAnimals(list) {
        setForm(current => ({
            ...current,
            animals: [
                ...new Set([
                    ...current.animals,
                    ...list.map(animal => Number(animal.id)),
                ]),
            ],
        }));
    }


    function clearAnimals() {
        setForm(current => ({
            ...current,
            animals: [],
        }));
    }


    function animalsBySpecies(species) {
        return animals.filter(animal =>
            String(animal.species || '')
                .toLowerCase() === species
        );
    }


    async function submit(event) {
        event.preventDefault();

        if (lock.current) {
            return;
        }

        if (!form.title.trim()) {
            return setError(
                'Enter a reminder title.'
            );
        }

        if (
            form.recurring &&
            (
                !Number.isInteger(
                    Number(form.recurrence_interval)
                ) ||
                Number(form.recurrence_interval) < 1
            )
        ) {
            return setError(
                'Enter a whole recurrence interval of at least 1.'
            );
        }

        if (
            form.medical_enabled &&
            !form.record_type.trim()
        ) {
            return setError(
                'Enter a medical record type.'
            );
        }

        if (isCreate && appliesTo === 'animals') {
            if (!form.animals.length) {
                return setError(
                    'Select at least one animal.'
                );
            }
        }

        if (
            !isCreate &&
            form.medical_enabled &&
            form.create_record_on_completion &&
            !form.animal
        ) {
            return setError(
                'Select an animal to create a medical record on completion.'
            );
        }

        if (
            isCreate &&
            appliesTo === 'general' &&
            form.medical_enabled &&
            form.create_record_on_completion
        ) {
            return setError(
                'A medical reminder that creates a medical record must be assigned to an animal.'
            );
        }

        lock.current = true;
        setError('');

        try {
            if (
                isCreate &&
                appliesTo === 'animals'
            ) {
                await onSubmit(
                    bulkReminderPayload(form),
                    true
                );
            } else {
                const payload = reminderPayload({
                    ...form,
                    animal:
                        appliesTo === 'general'
                            ? ''
                            : form.animal,
                });

                await onSubmit(
                    payload,
                    false
                );
            }
        } catch (err) {
            setError(errorText(err));
        } finally {
            lock.current = false;
        }
    }


    const selectedCount =
        form.animals.length;


    return (
        <form
            onSubmit={submit}
            className="rounded-[var(--radius-xl)] border border-saddle-brown/10 min-w-0 bg-white p-4 sm:p-8 shadow-sm space-y-6"
        >
            <ErrorMessage>
                {error}
            </ErrorMessage>

            <fieldset
                disabled={isLoading}
                className="min-w-0 space-y-6 disabled:opacity-60"
            >
                <legend className="font-serif text-lg font-bold text-saddle-brown mb-4">
                    Reminder details
                </legend>

                <Field label="Title *">
                    {input(
                        'title',
                        'text',
                        {
                            required: true,
                            maxLength: 200,
                        }
                    )}
                </Field>

                <Field label="Category">
                    <select
                        name="reminder_type"
                        value={form.reminder_type}
                        onChange={change}
                        className={inputClasses}
                    >
                        {[
                            ['general', 'General'],
                            ['medical', 'Medical'],
                            ['appointment', 'Appointment'],
                            ['feed', 'Feed / Supplies'],
                            ['other', 'Other'],
                        ].map(([value, label]) => (
                            <option
                                key={value}
                                value={value}
                            >
                                {label}
                            </option>
                        ))}
                    </select>
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Due date *">
                        {input(
                            'due_date',
                            'date',
                            { required: true }
                        )}
                    </Field>

                    <Field label="Time (optional)">
                        {input(
                            'due_time',
                            'time'
                        )}
                    </Field>
                </div>


                {isCreate ? (
                    <div className="space-y-4">
                        <div>
                            <span className="block text-sm font-medium text-saddle-brown mb-2">
                                Applies to
                            </span>

                            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4">
                                <label className="flex min-h-11 sm:min-h-0 items-center gap-3 sm:gap-2 text-sm">
                                    <input
                                        type="radio"
                                        name="appliesTo"
                                        value="animals"
                                        checked={
                                            appliesTo === 'animals'
                                        }
                                        onChange={() =>
                                            setAppliesTo('animals')
                                        }
                                        className="h-5 w-5 shrink-0 sm:h-4 sm:w-4 accent-saddle-brown"
                                    />

                                    Selected animals
                                </label>

                                <label className="flex min-h-11 sm:min-h-0 items-center gap-3 sm:gap-2 text-sm">
                                    <input
                                        type="radio"
                                        name="appliesTo"
                                        value="general"
                                        checked={
                                            appliesTo === 'general'
                                        }
                                        onChange={() =>
                                            setAppliesTo('general')
                                        }
                                        className="h-5 w-5 shrink-0 sm:h-4 sm:w-4 accent-saddle-brown"
                                    />

                                    General — no animal
                                </label>
                            </div>
                        </div>


                        {appliesTo === 'animals' && (
                            <div className="rounded-xl border border-saddle-brown/15 bg-desert-sand/30 p-4 space-y-4">

                                <input
                                    type="search"
                                    value={animalSearch}
                                    onChange={event =>
                                        setAnimalSearch(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Search animals…"
                                    className={inputClasses}
                                />

                                <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            selectAnimals(animals)
                                        }
                                        className={secondaryClasses}
                                    >
                                        Select All
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            selectAnimals(
                                                animalsBySpecies('horse')
                                            )
                                        }
                                        className={secondaryClasses}
                                    >
                                        All Horses
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            selectAnimals(
                                                animalsBySpecies('dog')
                                            )
                                        }
                                        className={secondaryClasses}
                                    >
                                        All Dogs
                                    </button>

                                    <button
                                        type="button"
                                        onClick={clearAnimals}
                                        className={secondaryClasses}
                                    >
                                        Clear
                                    </button>
                                </div>


                                {animalsLoading && (
                                    <p
                                        role="status"
                                        className="text-sm text-charcoal/70"
                                    >
                                        Loading animals…
                                    </p>
                                )}


                                {animalsError && (
                                    <div
                                        role="alert"
                                        className="text-sm text-rust"
                                    >
                                        Animals could not be loaded.{' '}

                                        <button
                                            type="button"
                                            onClick={refetch}
                                            className="underline"
                                        >
                                            Retry
                                        </button>
                                    </div>
                                )}


                                {!animalsLoading &&
                                    !animalsError &&
                                    (
                                        <div className="max-h-72 overflow-y-auto rounded-lg border border-saddle-brown/10 bg-white divide-y divide-saddle-brown/10">

                                            {filteredAnimals.map(
                                                animal => (
                                                    <label
                                                        key={animal.id}
                                                        className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-sage/10"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={
                                                                form.animals.includes(
                                                                    Number(
                                                                        animal.id
                                                                    )
                                                                )
                                                            }
                                                            onChange={() =>
                                                                toggleAnimal(
                                                                    animal.id
                                                                )
                                                            }
                                                            className="h-5 w-5 shrink-0 sm:h-4 sm:w-4 accent-saddle-brown"
                                                        />

                                                        <span className="min-w-0 flex-1 break-words">
                                                            {animal.name}
                                                        </span>

                                                        {animal.species && (
                                                            <span className="text-xs text-charcoal/50">
                                                                {animal.species}
                                                            </span>
                                                        )}
                                                    </label>
                                                )
                                            )}

                                            {!filteredAnimals.length && (
                                                <p className="p-4 text-sm text-charcoal/60">
                                                    No animals match your search.
                                                </p>
                                            )}
                                        </div>
                                    )}


                                <p className="text-sm font-medium text-saddle-brown">
                                    {selectedCount === 1
                                        ? '1 animal selected'
                                        : `${selectedCount} animals selected`}
                                </p>

                                {data?.next && (
                                    <p className="text-sm text-rust">
                                        Only the current page of animals is available for selection.
                                    </p>
                                )}
                            </div>
                        )}

                        {appliesTo === 'general' && (
                            <p className="text-sm text-charcoal/70">
                                This reminder will not be associated with a specific animal.
                            </p>
                        )}
                    </div>
                ) : (
                    <>
                        <Field label="Animal">
                            <select
                                name="animal"
                                value={form.animal}
                                onChange={change}
                                className={inputClasses}
                                disabled={animalsLoading}
                            >
                                <option value="">
                                    General — no specific animal
                                </option>

                                {form.animal &&
                                    !animals.some(
                                        animal =>
                                            String(animal.id) ===
                                            String(form.animal)
                                    ) && (
                                        <option value={form.animal}>
                                            {initialData.animal_name ||
                                                `Animal #${form.animal}`}
                                        </option>
                                    )}

                                {animals.map(animal => (
                                    <option
                                        key={animal.id}
                                        value={animal.id}
                                    >
                                        {animal.name}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        {animalsLoading && (
                            <p
                                role="status"
                                className="text-sm text-charcoal/70"
                            >
                                Loading animals…
                            </p>
                        )}

                        {animalsError && (
                            <div
                                role="alert"
                                className="text-sm text-rust"
                            >
                                Animals could not be loaded.{' '}

                                <button
                                    type="button"
                                    onClick={refetch}
                                    className="underline"
                                >
                                    Retry
                                </button>
                            </div>
                        )}
                    </>
                )}


                <Field label="Description / reminder notes">
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={change}
                        rows={4}
                        className={inputClasses}
                    />
                </Field>


                {!isCreate &&
                    check(
                        'active',
                        'Active reminder'
                    )}


                <div className="border-t border-saddle-brown/10 pt-6 space-y-4">
                    {check(
                        'recurring',
                        'Repeat this reminder'
                    )}

                    {form.recurring && (
                        <>
                            <div className="grid gap-4 md:grid-cols-2">
                                <Field label="Repeat every *">
                                    {input(
                                        'recurrence_interval',
                                        'number',
                                        {
                                            min: 1,
                                            step: 1,
                                            required: true,
                                        }
                                    )}
                                </Field>

                                <Field label="Unit">
                                    <select
                                        name="recurrence_unit"
                                        value={form.recurrence_unit}
                                        onChange={change}
                                        className={inputClasses}
                                    >
                                        {[
                                            ...new Set([
                                                ...recurrenceUnits,
                                                form.recurrence_unit,
                                            ]),
                                        ].map(unit => (
                                            <option
                                                key={unit}
                                                value={unit}
                                            >
                                                {unit}
                                            </option>
                                        ))}
                                    </select>
                                </Field>
                            </div>

                            <p className="text-sm text-charcoal/70">
                                The next due date is calculated by the server from the actual completion date.
                            </p>
                        </>
                    )}
                </div>


                <div className="border-t border-saddle-brown/10 pt-6 space-y-4">
                    {check(
                        'medical_enabled',
                        'Configure medical record on completion'
                    )}

                    {form.medical_enabled && (
                        <>
                            <Field label="Medical record type *">
                                {recordTypes.length ? (
                                    <select
                                        name="record_type"
                                        value={form.record_type}
                                        onChange={change}
                                        required
                                        className={inputClasses}
                                    >
                                        <option value="">
                                            Select record type
                                        </option>

                                        {form.record_type &&
                                            !recordTypes.some(
                                                type =>
                                                    type.value ===
                                                    form.record_type
                                            ) && (
                                                <option
                                                    value={
                                                        form.record_type
                                                    }
                                                >
                                                    {form.record_type}
                                                </option>
                                            )}

                                        {recordTypes.map(type => (
                                            <option
                                                key={type.value}
                                                value={type.value}
                                            >
                                                {type.display_name}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    input(
                                        'record_type',
                                        'text',
                                        {
                                            required: true,
                                            maxLength: 30,
                                            placeholder:
                                                'Medical record type code',
                                        }
                                    )
                                )}
                            </Field>

                            {!recordTypes.length && (
                                <p className="text-sm text-charcoal/70">
                                    Enter the exact record type code accepted by your medical records.
                                </p>
                            )}

                            {check(
                                'create_record_on_completion',
                                'Create a medical record when completed'
                            )}

                            {form.create_record_on_completion && (
                                <p className="text-sm text-charcoal/70">
                                    Treatment details are entered when you complete each animal's reminder.
                                </p>
                            )}
                        </>
                    )}
                </div>


                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 border-t border-saddle-brown/10 pt-6">
                    <button
                        type="button"
                        onClick={() =>
                            navigate('/admin/reminders')
                        }
                        className={secondaryClasses}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className={primaryClasses}
                    >
                        {isLoading
                            ? 'Saving…'
                            : isCreate &&
                                appliesTo === 'animals' &&
                                selectedCount > 0
                                ? `Create ${selectedCount} ${selectedCount === 1
                                    ? 'Reminder'
                                    : 'Reminders'
                                }`
                                : 'Save Reminder'}
                    </button>
                </div>
            </fieldset>
        </form>
    );
}