import { Resend } from 'resend'

// Lazy init so build doesn't fail without env vars
function getResend() {
  return new Resend(process.env.RESEND_API_KEY!)
}

export const resend = {
  emails: {
    send: (params: Parameters<Resend['emails']['send']>[0]) => getResend().emails.send(params),
  },
}

export const FROM_EMAIL = 'CBC <hola@cierrebajocontrol.com>'
