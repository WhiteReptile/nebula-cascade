import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface TermsAcceptanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccepted?: () => void;
}

export function TermsAcceptanceModal({ open, onOpenChange, onAccepted }: TermsAcceptanceModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [agreesPrivacy, setAgreesPrivacy] = useState(false);
  const [confirmsLegal, setConfirmsLegal] = useState(false);

  const handleAccept = async () => {
    setError(null);
    setIsSaving(true);

    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError || !userData?.user) {
      setError('Unable to verify your session. Please try again.');
      setIsSaving(false);
      return;
    }

    const ipResponse = await fetch('https://api.ipify.org?format=json');
    if (!ipResponse.ok) {
      setError('Unable to retrieve your IP address. Please try again.');
      setIsSaving(false);
      return;
    }

    const ipData = await ipResponse.json();
    const acceptedIp = typeof ipData?.ip === 'string' ? ipData.ip : null;
    if (!acceptedIp) {
      setError('Unable to retrieve a valid IP address.');
      setIsSaving(false);
      return;
    }

    const { error: updateError } = await supabase
      .from('players')
      .update({
        accepted_terms_version: '1.0',
        accepted_terms_at: new Date().toISOString(),
        accepted_ip: acceptedIp,
      })
      .eq('user_id', userData.user.id);

    if (updateError) {
      setError(updateError.message);
      setIsSaving(false);
      return;
    }

    setIsSaving(false);
    onAccepted?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-950 text-slate-100 border border-slate-800 shadow-2xl shadow-black/50">
        <DialogHeader>
          <DialogTitle className="font-mono text-white">Accept Terms of Service</DialogTitle>
          <DialogDescription className="font-mono text-sm text-slate-400">
            Antes de continuar, debes aceptar la versión 1.0 de los términos. Esta acción se guarda en tu perfil de jugador.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/90 p-5 font-mono text-slate-200">
          <p className="text-sm leading-6 text-slate-300">
            Aceptar los términos permite que sigamos respetando tus derechos como jugador, manteniendo el cumplimiento y el historial de aceptación.
          </p>
          <div className="rounded-lg bg-slate-950 p-4 text-xs leading-6 text-slate-100 ring-1 ring-slate-700">
            <p className="font-semibold text-slate-100">Términos incluidos en esta versión:</p>
            <p className="mt-2 text-slate-400">- Versión: 1.0</p>
            <p className="text-slate-400">- Fecha de aceptación guardada en tu cuenta</p>
            <p className="text-slate-400">- Se requiere para acceder a funciones restringidas</p>
          </div>

          <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-950 p-4 text-slate-200">
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                checked={hasReadTerms}
                onChange={(event) => setHasReadTerms(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-800 text-primary focus:ring-primary"
              />
              <span>
                He leído y comprendo los <strong>Terms of Service</strong>.
              </span>
            </label>
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                checked={agreesPrivacy}
                onChange={(event) => setAgreesPrivacy(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-800 text-primary focus:ring-primary"
              />
              <span>
                Acepto el uso de mis datos según la política de privacidad.
              </span>
            </label>
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                checked={confirmsLegal}
                onChange={(event) => setConfirmsLegal(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-800 text-primary focus:ring-primary"
              />
              <span>
                Confirmo que estoy autorizado para aceptar estos términos.
              </span>
            </label>
          </div>

          <a href="/legal" className="text-sm text-primary underline hover:text-primary/80">
            Read full Terms of Service
          </a>

          {error ? <p className="text-sm text-rose-400">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            className="font-mono"
            disabled={isSaving || !hasReadTerms || !agreesPrivacy || !confirmsLegal}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAccept}
            disabled={
              isSaving || !hasReadTerms || !agreesPrivacy || !confirmsLegal
            }
            className="font-mono"
          >
            {isSaving ? 'Saving…' : 'Accept'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
