
export function useSendEmail() {
  const sendEmail = async ({
    to,
    subject,
    html,
  }: {
    to: string;
    subject: string;
    html: string;
  }) => {
    try {
      const res = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, html }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al enviar el correo');
      }

      return true;
    } catch (error) {
      console.error('Error enviando correo:', error);
      return false;
    }
  };

  return { sendEmail };
}
