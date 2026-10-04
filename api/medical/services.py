from animals.models.horse import Horse


def sync_animal_measurements(animal):
    """
    Synchronize the animal's current measurements with the
    newest MedicalRecord containing each measurement.
    """

    latest_weight = (
        animal.medical_records
        .filter(weight__isnull=False)
        .order_by("-date", "-created_at")
        .first()
    )

    animal.weight = (
        latest_weight.weight
        if latest_weight
        else None
    )

    animal.save(update_fields=["weight"])

    # Height currently only applies to horses.
    try:
        horse = Horse.objects.get(pk=animal.pk)
    except Horse.DoesNotExist:
        return

    latest_height = (
        animal.medical_records
        .filter(height__isnull=False)
        .order_by("-date", "-created_at")
        .first()
    )

    horse.height = (
        latest_height.height
        if latest_height
        else None
    )

    horse.save(update_fields=["height"])