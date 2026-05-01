import { AppNameInput } from './AppNameInput';
import { DescriptionInput } from './DescriptionInput';
import { KeywordChips } from './KeywordChips';
import { PalettePicker } from './PalettePicker';
import { StyleSelect } from './StyleSelect';
import { DarkModeToggle } from './DarkModeToggle';
import { FillExampleButton } from './FillExampleButton';
import { ResetButton } from './ResetButton';
import { isFormEmpty } from '@/hooks/useFormState';
import type { FormState } from '@/types';

interface Props {
  form: FormState;
  update: <K extends keyof FormState>(patch: Pick<FormState, K>) => void;
  onFillExample: () => void;
  onReset: () => void;
}

export function FormPanel({ form, update, onFillExample, onReset }: Props) {
  const empty = isFormEmpty(form);

  return (
    <form className="space-y-5" onSubmit={(e) => e.preventDefault()} aria-label="로고 프롬프트 입력">
      {empty && <FillExampleButton onClick={onFillExample} />}

      <AppNameInput value={form.name} onChange={(name) => update({ name })} />
      <DescriptionInput
        value={form.description}
        onChange={(description) => update({ description })}
      />
      <KeywordChips
        values={form.keywords}
        onChange={(keywords) => update({ keywords })}
      />
      <PalettePicker
        value={form.paletteId}
        onChange={(paletteId) => update({ paletteId })}
      />
      <StyleSelect value={form.styleId} onChange={(styleId) => update({ styleId })} />
      <DarkModeToggle
        value={form.showBothModes}
        onChange={(showBothModes) => update({ showBothModes })}
      />

      <div className="flex justify-end pt-2">
        <ResetButton disabled={empty} onConfirm={onReset} />
      </div>
    </form>
  );
}
