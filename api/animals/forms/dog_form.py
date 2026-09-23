from animals.models.dog import Dog
from animals.models.animal import Animal
from django import forms

#Dog Admin Form
class DogAdminForm(forms.ModelForm):
    class Meta:
        model = Dog
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['sex'].choices = Animal.Sex.choices
        self.fields['species'].initial = Animal.Species.DOG
        self.fields['species'].widget = forms.HiddenInput()