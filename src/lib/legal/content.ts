// Textos legales de la web (aviso legal, privacidad y cookies) en español e inglés.
// Están pensados para una agencia con apartamentos en varios países (España,
// Colombia y otros): citan el RGPD y la Ley 1581 de 2012 de Colombia y remiten a la
// autoridad del país del usuario. Son una base razonable, no asesoría legal: el
// cliente debería hacerlos revisar por un profesional.
// Los datos del titular salen de /admin/ajustes (agency_settings).

export type LegalOwner = {
  name: string;
  taxId: string;
  address: string;
  email: string;
  phone: string;
};

export type LegalSection = {
  title: string;
  paragraphs?: string[];
  list?: string[];
  table?: { head: string[]; rows: string[][] };
};

export type LegalDocument = {
  title: string;
  intro: string;
  updated: string;
  sections: LegalSection[];
};

type Locale = "es" | "en";

const UPDATED = { es: "Última actualización: 13 de octubre de 2026", en: "Last updated: 13 October 2026" };
const BRAND = "Euronest Apartamentos";

function ownerName(owner: LegalOwner) {
  return owner.name || BRAND;
}

// Ficha del titular: solo los datos que estén rellenos.
function ownerList(locale: Locale, owner: LegalOwner) {
  const labels =
    locale === "es"
      ? { name: "Titular", brand: "Nombre comercial", taxId: "Identificación fiscal", address: "Domicilio", email: "Correo", phone: "Teléfono" }
      : { name: "Owner", brand: "Trade name", taxId: "Tax ID", address: "Address", email: "Email", phone: "Phone" };
  return [
    owner.name && `${labels.name}: ${owner.name}`,
    `${labels.brand}: ${BRAND}`,
    owner.taxId && `${labels.taxId}: ${owner.taxId}`,
    owner.address && `${labels.address}: ${owner.address}`,
    owner.email && `${labels.email}: ${owner.email}`,
    owner.phone && `${labels.phone}: ${owner.phone}`,
  ].filter((item): item is string => Boolean(item));
}

export function legalNotice(locale: Locale, owner: LegalOwner): LegalDocument {
  const name = ownerName(owner);
  const contact = owner.email || owner.phone;

  if (locale === "en") {
    return {
      title: "Legal notice",
      intro: `This website is owned by ${name}, which operates under the trade name ${BRAND}. By using it you accept these terms.`,
      updated: UPDATED.en,
      sections: [
        { title: "Website owner", list: ownerList(locale, owner) },
        {
          title: "Purpose of the website",
          paragraphs: [
            `The website provides information about the apartments managed by ${BRAND} in several cities and countries, and lets you send booking requests.`,
            "Sending a request is neither a booking nor a payment: a booking only exists once our team confirms it in writing. The website does not take payments.",
          ],
        },
        {
          title: "Prices and availability",
          paragraphs: [
            "Prices are per night and indicative until the booking is confirmed. When we confirm, we tell you the total, any local taxes or fees that apply and how to pay.",
            "We update availability frequently, but it may change until the booking is confirmed.",
          ],
        },
        {
          title: "Use of the website",
          paragraphs: [
            "You agree to use the website lawfully, to provide true information in your requests and not to misuse it (automated mass requests, copying its content or trying to access restricted areas).",
          ],
        },
        {
          title: "Intellectual property",
          paragraphs: [
            `The texts, design, brand and photos of the website belong to ${name} or to third parties who have authorised their use. They may not be reproduced without permission.`,
          ],
        },
        {
          title: "Liability and external links",
          paragraphs: [
            "We do our best to keep the information accurate and the website available, but we cannot guarantee that it is error-free or always available.",
            "Some links take you to other websites (for example Google Maps or WhatsApp). We are not responsible for their content or their privacy policies.",
          ],
        },
        {
          title: "Applicable law",
          paragraphs: [
            "This notice is governed by the law of the country where the owner is established. If you are a consumer, you keep the rights granted to you by the law of your country of residence.",
            contact ? `For any question or complaint, write to us at ${contact}.` : "",
          ].filter(Boolean),
        },
      ],
    };
  }

  return {
    title: "Aviso legal",
    intro: `Esta web es propiedad de ${name}, que opera con el nombre comercial ${BRAND}. Al usarla aceptas estas condiciones.`,
    updated: UPDATED.es,
    sections: [
      { title: "Titular de la web", list: ownerList(locale, owner) },
      {
        title: "Objeto de la web",
        paragraphs: [
          `La web informa sobre los apartamentos que gestiona ${BRAND} en distintas ciudades y países, y permite enviar solicitudes de reserva.`,
          "Enviar una solicitud no es una reserva ni un pago: la reserva solo existe cuando nuestro equipo la confirma por escrito. La web no cobra pagos.",
        ],
      },
      {
        title: "Precios y disponibilidad",
        paragraphs: [
          "Los precios son por noche y orientativos hasta que se confirma la reserva. Al confirmarla te indicamos el total, las tasas o impuestos locales que correspondan y la forma de pago.",
          "Actualizamos la disponibilidad con frecuencia, pero puede cambiar hasta que la reserva esté confirmada.",
        ],
      },
      {
        title: "Uso de la web",
        paragraphs: [
          "Te comprometes a usar la web de forma lícita, a dar datos verdaderos en tus solicitudes y a no hacer un uso abusivo de ella (envíos masivos automatizados, copia de su contenido o intentos de acceder a zonas restringidas).",
        ],
      },
      {
        title: "Propiedad intelectual",
        paragraphs: [
          `Los textos, el diseño, la marca y las fotos de la web pertenecen a ${name} o a terceros que han autorizado su uso. No se pueden reproducir sin permiso.`,
        ],
      },
      {
        title: "Responsabilidad y enlaces externos",
        paragraphs: [
          "Hacemos lo posible para que la información sea correcta y la web esté disponible, pero no podemos garantizar que no haya errores ni interrupciones.",
          "Algunos enlaces llevan a otras webs (por ejemplo, Google Maps o WhatsApp). No somos responsables de su contenido ni de sus políticas de privacidad.",
        ],
      },
      {
        title: "Legislación aplicable",
        paragraphs: [
          "Este aviso se rige por la legislación del país donde está establecido el titular. Si eres consumidor, conservas los derechos que te reconozca la normativa de tu país de residencia.",
          contact ? `Para cualquier duda o reclamación, escríbenos a ${contact}.` : "",
        ].filter(Boolean),
      },
    ],
  };
}

export function privacyPolicy(locale: Locale, owner: LegalOwner): LegalDocument {
  const contact = owner.email || owner.phone;

  if (locale === "en") {
    return {
      title: "Privacy policy",
      intro: `At ${BRAND} we handle your data carefully and only to manage your bookings. This policy explains what data we collect, why, and what rights you have. It applies to the data you give us on this website and when you contact us by email or WhatsApp.`,
      updated: UPDATED.en,
      sections: [
        { title: "Who is responsible for your data", list: ownerList(locale, owner) },
        {
          title: "What data we process",
          list: [
            "Request details: name, email, phone or WhatsApp, country of residence, dates, number of guests, apartment or city and the message you write to us.",
            "Payment records that we enter manually (amount, date and payment method). The website does not take payments and we never store your full card details.",
            "Minimal technical data: your IP address, irreversibly encrypted, to limit abusive submissions. It is deleted after 24 hours.",
            "If you write to us by WhatsApp or email, the content of that conversation.",
          ],
        },
        {
          title: "Why we use it",
          list: [
            "To manage your request and booking: check availability, contact you, confirm the booking and send you the acknowledgement email and the voucher.",
            "To let you check the status of your booking with your booking reference and PIN or the voucher QR code.",
            "To comply with legal obligations (accounting, tax and, where applicable, guest registration).",
            "To protect the website from abuse.",
          ],
          paragraphs: ["We do not use your data for advertising and we never sell it."],
        },
        {
          title: "Legal basis and authorisation",
          paragraphs: [
            "We process your data because it is necessary to manage the booking you request (pre-contractual steps and contract), to comply with legal obligations and, for protection against abuse, on the basis of our legitimate interest.",
            "When you send a form you also expressly authorise us to process your data for these purposes, as required, among others, by Colombian Law 1581 of 2012.",
          ],
        },
        {
          title: "Who we share it with",
          paragraphs: [
            "We do not share your data with third parties unless required by law. We use providers that process data on our behalf under contract: Supabase (database and files), Vercel (website hosting) and Resend (email delivery).",
            "If you contact us by WhatsApp, that conversation is handled by WhatsApp (Meta) under its own privacy policy.",
          ],
        },
        {
          title: "International transfers",
          paragraphs: [
            "Our providers store data in the United States. These transfers are made with the safeguards required by law (for example the European Commission's standard contractual clauses or the EU-US Data Privacy Framework, depending on the provider).",
            "As we work with apartments in several countries, your data may also be needed in the country where the apartment you book is located.",
          ],
        },
        {
          title: "How long we keep it",
          list: [
            "Requests that are never confirmed: up to 12 months.",
            "Confirmed bookings and their payments: as long as legal, tax and accounting obligations require (usually between 5 and 10 years, depending on the country).",
            "Technical IP records: 24 hours.",
          ],
        },
        {
          title: "Your rights",
          paragraphs: [
            "You can ask at any time to access, correct, update or delete your data, to object to or restrict its processing, to receive it in a portable format and to withdraw your authorisation.",
            contact
              ? `Write to us at ${contact} with your name and, if you have one, your booking reference. We will reply within the legal deadlines.`
              : "Write to us with your name and, if you have one, your booking reference. We will reply within the legal deadlines.",
            "If you are not satisfied, you can complain to the data protection authority of your country, for example the Spanish Data Protection Agency (aepd.es) in Spain or the Superintendence of Industry and Commerce (sic.gov.co) in Colombia.",
          ],
        },
        {
          title: "Security",
          paragraphs: [
            "We apply technical and organisational measures: encrypted connections, restricted access to the management panel and the database, and per-user access controls.",
          ],
        },
        {
          title: "Minors",
          paragraphs: ["The website is not aimed at people under 18. Bookings must be made by an adult."],
        },
        {
          title: "Changes",
          paragraphs: ["We may update this policy. The current version will always be published here with its date."],
        },
      ],
    };
  }

  return {
    title: "Política de privacidad",
    intro: `En ${BRAND} tratamos tus datos con cuidado y solo para gestionar tus reservas. Esta política explica qué datos recogemos, para qué y qué derechos tienes. Se aplica a los datos que nos das en esta web y cuando nos contactas por correo o WhatsApp.`,
    updated: UPDATED.es,
    sections: [
      { title: "Responsable de tus datos", list: ownerList(locale, owner) },
      {
        title: "Qué datos tratamos",
        list: [
          "Datos de la solicitud: nombre, correo, teléfono o WhatsApp, país de residencia, fechas, número de huéspedes, apartamento o ciudad y el mensaje que nos escribas.",
          "Registro de pagos que anotamos a mano (importe, fecha y forma de pago). La web no cobra pagos y nunca guardamos los datos completos de tu tarjeta.",
          "Datos técnicos mínimos: tu dirección IP, cifrada de forma irreversible, para limitar envíos abusivos. Se borra a las 24 horas.",
          "Si nos escribes por WhatsApp o por correo, el contenido de esa conversación.",
        ],
      },
      {
        title: "Para qué los usamos",
        list: [
          "Para gestionar tu solicitud y tu reserva: comprobar la disponibilidad, contactarte, confirmar la reserva y enviarte el correo de recepción y el voucher.",
          "Para que puedas consultar el estado de tu reserva con el localizador y el PIN o con el código QR del voucher.",
          "Para cumplir obligaciones legales (contables, fiscales y, cuando corresponda, de registro de huéspedes).",
          "Para proteger la web frente a abusos.",
        ],
        paragraphs: ["No usamos tus datos para publicidad ni los vendemos."],
      },
      {
        title: "Base legal y autorización",
        paragraphs: [
          "Tratamos tus datos porque son necesarios para gestionar la reserva que nos pides (medidas precontractuales y contrato), para cumplir obligaciones legales y, en la protección frente a abusos, por nuestro interés legítimo.",
          "Al enviar un formulario, además, nos autorizas expresamente a tratarlos con estas finalidades, como exige, entre otras, la Ley 1581 de 2012 de Colombia.",
        ],
      },
      {
        title: "Con quién los compartimos",
        paragraphs: [
          "No cedemos tus datos a terceros salvo obligación legal. Usamos proveedores que los tratan por nuestra cuenta y con contrato: Supabase (base de datos y archivos), Vercel (alojamiento de la web) y Resend (envío de correos).",
          "Si nos contactas por WhatsApp, esa conversación la gestiona WhatsApp (Meta) según su propia política de privacidad.",
        ],
      },
      {
        title: "Transferencias internacionales",
        paragraphs: [
          "Nuestros proveedores alojan los datos en Estados Unidos. Estas transferencias se hacen con las garantías que exige la normativa (por ejemplo, las cláusulas contractuales tipo de la Comisión Europea o el Marco de Privacidad de Datos UE-EE. UU., según el proveedor).",
          "Como trabajamos con apartamentos en varios países, tus datos también pueden ser necesarios en el país donde está el apartamento que reservas.",
        ],
      },
      {
        title: "Cuánto tiempo los conservamos",
        list: [
          "Solicitudes que no llegan a confirmarse: un máximo de 12 meses.",
          "Reservas confirmadas y sus pagos: el tiempo que exijan las obligaciones legales, fiscales y contables (normalmente entre 5 y 10 años, según el país).",
          "Registros técnicos de IP: 24 horas.",
        ],
      },
      {
        title: "Tus derechos",
        paragraphs: [
          "Puedes pedir en cualquier momento acceder a tus datos, rectificarlos, actualizarlos o suprimirlos, oponerte a su tratamiento o limitarlo, recibirlos en un formato portable y retirar tu autorización.",
          contact
            ? `Escríbenos a ${contact} indicando tu nombre y, si lo tienes, el localizador de tu reserva. Te responderemos en los plazos legales.`
            : "Escríbenos indicando tu nombre y, si lo tienes, el localizador de tu reserva. Te responderemos en los plazos legales.",
          "Si no estás conforme, puedes reclamar ante la autoridad de protección de datos de tu país; por ejemplo, la Agencia Española de Protección de Datos (aepd.es) en España o la Superintendencia de Industria y Comercio (sic.gov.co) en Colombia.",
        ],
      },
      {
        title: "Seguridad",
        paragraphs: [
          "Aplicamos medidas técnicas y organizativas: conexiones cifradas, acceso restringido al panel de gestión y a la base de datos, y controles de acceso por usuario.",
        ],
      },
      {
        title: "Menores de edad",
        paragraphs: ["La web no está dirigida a menores de 18 años. Las reservas debe hacerlas una persona adulta."],
      },
      {
        title: "Cambios en esta política",
        paragraphs: ["Podemos actualizar esta política. Aquí publicaremos siempre la versión vigente con su fecha."],
      },
    ],
  };
}

export function cookiesPolicy(locale: Locale): LegalDocument {
  if (locale === "en") {
    return {
      title: "Cookie policy",
      intro:
        "This website only uses technical cookies, which are needed for it to work. We do not use analytics, advertising or social media cookies, so we do not ask for your consent.",
      updated: UPDATED.en,
      sections: [
        {
          title: "Cookies we use",
          table: {
            head: ["Cookie", "Provider", "Purpose", "Duration"],
            rows: [
              [
                "sb-…-auth-token",
                "Supabase",
                "Keeps the session of the people who manage the website (management panel only).",
                "Until they sign out",
              ],
            ],
          },
          paragraphs: [
            "Visitors who only browse apartments or send requests do not receive cookies from this website.",
          ],
        },
        {
          title: "External websites",
          paragraphs: [
            "Google Maps and WhatsApp links open on their own websites, which use their own cookies under their own policies.",
          ],
        },
        {
          title: "How to delete cookies",
          paragraphs: ["You can view and delete cookies at any time in your browser settings."],
        },
      ],
    };
  }

  return {
    title: "Política de cookies",
    intro:
      "Esta web solo usa cookies técnicas, necesarias para que funcione. No usamos cookies de análisis, de publicidad ni de redes sociales, por eso no te pedimos consentimiento.",
    updated: UPDATED.es,
    sections: [
      {
        title: "Cookies que usamos",
        table: {
          head: ["Cookie", "Proveedor", "Para qué sirve", "Duración"],
          rows: [
            [
              "sb-…-auth-token",
              "Supabase",
              "Mantiene la sesión de las personas que gestionan la web (solo en el panel de gestión).",
              "Hasta cerrar sesión",
            ],
          ],
        },
        paragraphs: ["Quien solo consulta apartamentos o envía solicitudes no recibe cookies de esta web."],
      },
      {
        title: "Webs externas",
        paragraphs: [
          "Los enlaces a Google Maps y WhatsApp se abren en sus propias webs, que usan sus propias cookies según sus políticas.",
        ],
      },
      {
        title: "Cómo borrar las cookies",
        paragraphs: ["Puedes ver y borrar las cookies cuando quieras desde la configuración de tu navegador."],
      },
    ],
  };
}
