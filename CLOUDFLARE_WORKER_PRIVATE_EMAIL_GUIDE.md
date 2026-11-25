# Cloudflare Worker + Namecheap Private Email: 2-Way Email Flow Guide

This guide gives you the exact setup to achieve:
1. **Lead Notification**: Web form submission data arrives in your Namecheap Private Email inbox (`you@yourdomain.com`).
2. **Auto-Reply ACK**: An automated acknowledgment email is sent immediately to the user's email confirming receipt.
3. **100% Free**: Uses Cloudflare Workers free tier + free email API relay (Resend free tier: 3,000 emails/month or 100/day).

---

## Architecture Flow

```
[User submits form on website]
            |
            v  (POST JSON)
  [Cloudflare Worker]
       |         |
       |         +----> 1. Notification Email -> your Namecheap Private Email inbox
       |
       +--------------> 2. Automated ACK Email -> User's inbox (from: you@yourdomain.com)
```

---

## Step 1: Free Email API Relay (Resend - 2 Minutes)

Cloudflare Workers run in an isolated V8 environment and cannot open raw TCP SMTP sockets to `mail.privateemail.com` on the free tier. An HTTP email relay API like Resend (free) solves this cleanly:

1. Create a free account at [https://resend.com](https://resend.com).
2. Go to **Domains** -> **Add Domain** -> Enter your domain (e.g. `yourdomain.com`).
3. Add the 3 DNS records Resend gives you (DKIM, SPF, MX/TXT) into **Namecheap** -> **Domain List** -> **Manage** -> **Advanced DNS**.
4. Go to **API Keys** -> Create an API key (`re_xxxxxxxxx`) and copy it.

---

## Step 2: Create the Cloudflare Worker

1. Log in to [https://dash.cloudflare.com](https://dash.cloudflare.com).
2. Go to **Workers & Pages** -> **Create application** -> **Create Worker**.
3. Name it `valentina-lead-contact` -> Click **Deploy**.
4. Click **Edit code** and paste the following complete script:

```javascript
export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*", // Or "https://yourdomain.com"
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // Handle browser CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    try {
      const payload = await request.json();
      const { client, answers, recommendations } = payload;

      if (!client || !client.email || !client.name) {
        return new Response(JSON.stringify({ error: "Missing required fields" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      const clientName = client.name.trim();
      const clientEmail = client.email.trim();
      const clientCompany = client.company ? client.company.trim() : "N/A";
      const clientNotes = client.notes ? client.notes.trim() : "None";

      // -----------------------------------------------------------------
      // EMAIL 1: Notification to YOUR Namecheap Private Email
      // -----------------------------------------------------------------
      const notificationHtml = `
        <h2>Nuevo Lead / Diagnóstico Digital</h2>
        <p><strong>Nombre:</strong> ${clientName}</p>
        <p><strong>Empresa:</strong> ${clientCompany}</p>
        <p><strong>Email:</strong> <a href="mailto:${clientEmail}">${clientEmail}</a></p>
        <p><strong>Notas:</strong> ${clientNotes}</p>
        <hr>
        <h3>Respuestas del Diagnóstico:</h3>
        <pre style="background:#f4f4f4;padding:10px;">${JSON.stringify(answers, null, 2)}</pre>
        <h3>Recomendaciones:</h3>
        <pre style="background:#f4f4f4;padding:10px;">${JSON.stringify(recommendations, null, 2)}</pre>
      `;

      const notifyPromise = fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: `Web Leads <notifications@${env.DOMAIN}>`,
          to: [env.MY_PRIVATE_EMAIL], // Your Namecheap Private Email
          reply_to: clientEmail,
          subject: `[Lead Web] ${clientName} - ${clientCompany}`,
          html: notificationHtml
        })
      });

      // -----------------------------------------------------------------
      // EMAIL 2: Automatic ACK to the USER
      // -----------------------------------------------------------------
      const autoReplyHtml = `
        <div style="font-family: sans-serif; line-height: 1.6; color: #151515;">
          <h2>Hola ${clientName},</h2>
          <p>Gracias por completar la evaluación y ponerte en contacto.</p>
          <p>Hemos recibido tus respuestas y las recomendaciones preliminares para <strong>${clientCompany}</strong>.</p>
          <p>Revisaremos tu caso detalladamente y te contactaremos en un plazo de 24 a 48 horas laborales.</p>
          <br>
          <p>Saludos cordiales,<br><strong>Valentina Alemán</strong><br><a href="https://${env.DOMAIN}">${env.DOMAIN}</a></p>
        </div>
      `;

      const autoReplyPromise = fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: `Valentina Alemán <hello@${env.DOMAIN}>`,
          to: [clientEmail],
          reply_to: env.MY_PRIVATE_EMAIL, // When client replies, it goes to your Namecheap inbox
          subject: `Confirmación: Recibimos tu solicitud (${clientCompany})`,
          html: autoReplyHtml
        })
      });

      // Execute both emails concurrently
      const [resNotify, resAutoReply] = await Promise.all([notifyPromise, autoReplyPromise]);

      if (!resNotify.ok) {
        const errText = await resNotify.text();
        throw new Error(`Failed to notify inbox: ${errText}`);
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    } catch (err) {
      return new Response(JSON.stringify({ success: false, error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  }
};
```

5. Click **Save and Deploy**.

---

## Step 3: Configure Worker Environment Variables

In your Cloudflare Worker page:
1. Go to **Settings** -> **Variables and Secrets**.
2. Click **Add** under *Environment Variables*:
   - `MY_PRIVATE_EMAIL`: Your full Namecheap email (e.g. `you@yourdomain.com`).
   - `DOMAIN`: Your domain without `https://` (e.g. `yourdomain.com`).
   - `RESEND_API_KEY`: Click *Encrypt* -> paste your `re_xxxxxxxxx` key.
3. Click **Deploy**.
4. Copy your Worker URL from the overview page:
   `https://valentina-lead-contact.guillejesus.workers.dev`

---

## Step 4: Update `script.js` in this Workspace

Open [script.js](script.js#L750-L780) and wire the form submission to your Worker URL:

```javascript
      // Prepare payload
      const assessmentPayload = {
        client: {
          name: leadName.value.trim(),
          company: leadCompany.value.trim(),
          email: leadEmail.value.trim(),
          notes: leadNotes ? leadNotes.value.trim() : ''
        },
        answers: userAnswers,
        recommendations: generatedRecommendations
      };

      if (btnSubmitLead) {
        btnSubmitLead.disabled = true;
        btnSubmitLead.textContent = 'ENVIANDO...';
      }

      fetch('https://valentina-lead-contact.guillejesus.workers.dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assessmentPayload)
      })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok && data.success) {
          btnSubmitLead.textContent = '✓ SOLICITUD ENVIADA';
          if (formFeedback) {
            formFeedback.hidden = false;
            formFeedback.className = 'dp-form-feedback is-success';
            formFeedback.textContent = `Gracias, ${leadName.value.trim()} — hemos recibido tu diagnóstico y te enviamos un correo de confirmación.`;
          }
        } else {
          throw new Error(data.error || 'Error al procesar solicitud');
        }
      })
      .catch((err) => {
        console.error('Submission error:', err);
        btnSubmitLead.disabled = false;
        btnSubmitLead.textContent = 'REINTENTAR ENVÍO →';
        if (formFeedback) {
          formFeedback.hidden = false;
          formFeedback.className = 'dp-form-feedback is-error';
          formFeedback.textContent = 'Hubo un error al enviar tu solicitud. Por favor intenta de nuevo.';
        }
      });
```

---

## Step 5: Test Verification

1. Submit a test in your browser with your real personal email.
2. Verify:
   - **Your Namecheap inbox**: Receives the lead notification with the full diagnostic data.
   - **The test user's email**: Receives the instant acknowledgment ACK message.
   - **Replying to the ACK email**: Hits your Namecheap Private Email directly.
