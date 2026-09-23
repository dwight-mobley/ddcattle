from animals.models.horse import Horse
from animals.models.animal import Animal
from django import forms
#Horse Admin Form
class HorseAdminForm(forms.ModelForm):
    class Meta:
        model = Horse
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # 1. Force the horse-specific choices onto the 'sex' field dropdown
        self.fields['sex'].choices = Horse.HorseSex.choices
        # 2. Force the species default to 'horse' and make it hidden or read-only
        self.fields['species'].initial = Animal.Species.HORSE
        self.fields['species'].widget = forms.HiddenInput()