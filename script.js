const WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbzoUCYE_rtwDtkgZFSxXOvOOjfL09ixnhy5dFfuzjitjk0irxWwMPWRRDoXP7Z5x0RPtw/exec";

const DUPLICATE_WINDOW_MS = 60 * 1000;

const RECENT_SUBMISSION_STORAGE_KEY =
  "digmarketingmaul_recent_submission";

const ALLOWED_SERVICES = new Set([
  "website-development",
  "meta-ads",
  "google-ads",
  "tracking-analytics",
  "seo",
  "lainnya"
]);


document.addEventListener(
  "DOMContentLoaded",
  function () {
    setupDemoButton();
    populateAttributionFields();
    setupClientValidation();
    setupLeadForm();

    console.log(
      "Website Dig Marketing Maul berhasil dimuat."
    );
  }
);


/*
  Demo tombol JavaScript
*/

function setupDemoButton() {
  const actionButton =
    document.getElementById("actionButton");

  const message =
    document.getElementById("message");

  if (!actionButton || !message) {
    return;
  }

  actionButton.addEventListener(
    "click",
    function () {
      message.textContent =
        "Tombol berhasil diklik. JavaScript sedang bekerja!";

      actionButton.textContent =
        "Berhasil Diklik";
    }
  );
}


/*
  Menyimpan UTM dan GCLID di browser
*/

function populateAttributionFields() {
  const urlParameters =
    new URLSearchParams(
      window.location.search
    );

  const attributionFields = {
    utm_source: "utmSource",
    utm_medium: "utmMedium",
    utm_campaign: "utmCampaign",
    gclid: "gclid"
  };

  Object.entries(attributionFields).forEach(
    function ([parameterName, fieldId]) {
      const parameterValue =
        urlParameters.get(parameterName);

      if (parameterValue) {
        saveToLocalStorage(
          parameterName,
          parameterValue
        );
      }

      const storedValue =
        parameterValue ||
        getFromLocalStorage(parameterName) ||
        "";

      const hiddenField =
        document.getElementById(fieldId);

      if (hiddenField) {
        hiddenField.value =
          storedValue;
      }
    }
  );

  let landingPage =
    getFromLocalStorage("landing_page");

  if (!landingPage) {
    landingPage =
      window.location.href;

    saveToLocalStorage(
      "landing_page",
      landingPage
    );
  }

  const landingPageField =
    document.getElementById(
      "landingPage"
    );

  if (landingPageField) {
    landingPageField.value =
      landingPage;
  }
}


/*
  Helper untuk localStorage
*/

function saveToLocalStorage(key, value) {
  try {
    localStorage.setItem(
      `digmarketingmaul_${key}`,
      value
    );
  } catch (error) {
    console.warn(
      "Browser tidak mengizinkan penyimpanan localStorage.",
      error
    );
  }
}

function getFromLocalStorage(key) {
  try {
    return localStorage.getItem(
      `digmarketingmaul_${key}`
    );
  } catch (error) {
    return null;
  }
}


/*
  Mengambil seluruh field utama form
*/

function getLeadFields() {
  return {
    fullName:
      document.getElementById(
        "fullName"
      ),

    email:
      document.getElementById(
        "email"
      ),

    phone:
      document.getElementById(
        "phone"
      ),

    service:
      document.getElementById(
        "service"
      ),

    message:
      document.getElementById(
        "leadMessage"
      ),

    consent:
      document.getElementById(
        "consent"
      )
  };
}


/*
  Menyiapkan validasi client-side
*/

function setupClientValidation() {
  const fields =
    Object.values(getLeadFields())
      .filter(Boolean);

  fields.forEach(function (field) {
    const eventName =
      field.type === "checkbox" ||
      field.tagName === "SELECT"
        ? "change"
        : "input";

    field.addEventListener(
      eventName,
      function () {
        validateField(field);
      }
    );

    field.addEventListener(
      "blur",
      function () {
        validateField(field);
      }
    );
  });
}


/*
  Memvalidasi seluruh form
*/

function validateLeadForm(leadForm) {
  const fields =
    Object.values(getLeadFields())
      .filter(Boolean);

  let firstInvalidField = null;

  fields.forEach(function (field) {
    const isValid =
      validateField(field);

    if (
      !isValid &&
      !firstInvalidField
    ) {
      firstInvalidField = field;
    }
  });

  if (firstInvalidField) {
    leadForm.reportValidity();
    firstInvalidField.focus();

    return false;
  }

  return true;
}


/*
  Pesan validasi berbahasa Indonesia
*/

function validateField(field) {
  field.setCustomValidity("");

  const value =
    typeof field.value === "string"
      ? field.value.trim()
      : "";

  switch (field.id) {
    case "fullName":
      if (!value) {
        field.setCustomValidity(
          "Nama lengkap wajib diisi."
        );

      } else if (value.length < 2) {
        field.setCustomValidity(
          "Nama lengkap minimal 2 karakter."
        );

      } else if (value.length > 100) {
        field.setCustomValidity(
          "Nama lengkap maksimal 100 karakter."
        );
      }

      break;


    case "email": {
      const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

      if (!value) {
        field.setCustomValidity(
          "Email wajib diisi."
        );

      } else if (value.length > 150) {
        field.setCustomValidity(
          "Email maksimal 150 karakter."
        );

      } else if (
        !emailPattern.test(value)
      ) {
        field.setCustomValidity(
          "Masukkan alamat email yang valid."
        );
      }

      break;
    }


    case "phone": {
      const allowedCharactersPattern =
        /^[0-9+() -]{9,20}$/;

      const phoneDigits =
        value.replace(/\D/g, "");

      if (!value) {
        field.setCustomValidity(
          "Nomor WhatsApp wajib diisi."
        );

      } else if (
        !allowedCharactersPattern.test(
          value
        )
      ) {
        field.setCustomValidity(
          "Gunakan angka, tanda tambah, spasi, tanda kurung, atau tanda hubung."
        );

      } else if (
        phoneDigits.length < 9 ||
        phoneDigits.length > 15
      ) {
        field.setCustomValidity(
          "Nomor WhatsApp harus terdiri dari 9–15 digit."
        );
      }

      break;
    }


    case "service":
      if (!value) {
        field.setCustomValidity(
          "Silakan pilih kebutuhan layanan."
        );

      } else if (
        !ALLOWED_SERVICES.has(value)
      ) {
        field.setCustomValidity(
          "Pilihan layanan tidak valid."
        );
      }

      break;


    case "leadMessage":
      if (!value) {
        field.setCustomValidity(
          "Ceritakan kebutuhan Anda."
        );

      } else if (value.length < 10) {
        field.setCustomValidity(
          "Pesan minimal 10 karakter."
        );

      } else if (value.length > 1000) {
        field.setCustomValidity(
          "Pesan maksimal 1.000 karakter."
        );
      }

      break;


    case "consent":
      if (!field.checked) {
        field.setCustomValidity(
          "Anda perlu menyetujui penggunaan data sebelum mengirim form."
        );
      }

      break;
  }

  return field.checkValidity();
}


/*
  Menyiapkan waktu pengiriman
*/

function setSubmittedAt() {
  const submittedAtField =
    document.getElementById(
      "submittedAt"
    );

  if (submittedAtField) {
    submittedAtField.value =
      new Date().toISOString();
  }
}


/*
  Mengirim form ke Google Apps Script
*/

function setupLeadForm() {
  const leadForm =
    document.getElementById(
      "leadForm"
    );

  const submitButton =
    document.getElementById(
      "submitButton"
    );

  const formStatus =
    document.getElementById(
      "formStatus"
    );

  if (
    !leadForm ||
    !submitButton ||
    !formStatus
  ) {
    return;
  }

  let isSubmitting = false;

  leadForm.addEventListener(
    "submit",
    async function (event) {
      event.preventDefault();

      if (isSubmitting) {
        return;
      }

      if (!validateLeadForm(leadForm)) {
        return;
      }

      populateAttributionFields();
      setSubmittedAt();

      const formData =
        new FormData(leadForm);

      const submissionFingerprint =
        createSubmissionFingerprint(
          formData
        );

      const remainingWaitSeconds =
        getDuplicateWaitSeconds(
          submissionFingerprint
        );

      if (remainingWaitSeconds > 0) {
        showFormStatus(
          formStatus,
          `Permintaan yang sama baru saja dikirim. Tunggu sekitar ${remainingWaitSeconds} detik sebelum mencoba kembali.`,
          "error"
        );

        return;
      }

      const requestBody =
        new URLSearchParams();

      formData.forEach(
        function (value, key) {
          requestBody.append(
            key,
            String(value)
          );
        }
      );

      isSubmitting = true;

      submitButton.disabled = true;
      submitButton.textContent =
        "Sedang Mengirim...";

      showFormStatus(
        formStatus,
        "",
        ""
      );

      try {
        await fetch(WEB_APP_URL, {
          method: "POST",
          mode: "no-cors",
          body: requestBody
        });

        saveRecentSubmission(
          submissionFingerprint
        );

        showFormStatus(
          formStatus,
          "Terima kasih. Permintaan Anda telah dikirim.",
          "success"
        );

        leadForm.reset();

        populateAttributionFields();

      } catch (error) {
        console.error(
          "Form gagal dikirim:",
          error
        );

        showFormStatus(
          formStatus,
          "Data belum berhasil dikirim. Silakan periksa koneksi dan coba kembali.",
          "error"
        );

      } finally {
        isSubmitting = false;

        submitButton.disabled = false;
        submitButton.textContent =
          "Kirim Permintaan";
      }
    }
  );
}


/*
  Menampilkan status form
*/

function showFormStatus(
  formStatus,
  message,
  statusType
) {
  formStatus.textContent = message;
  formStatus.className =
    "form-status";

  if (statusType) {
    formStatus.classList.add(
      statusType
    );
  }
}


/*
  Membuat fingerprint sederhana
  tanpa menyimpan data mentah pengguna
*/

function createSubmissionFingerprint(
  formData
) {
  const fingerprintSource = [
    String(
      formData.get("full_name") || ""
    ).trim().toLowerCase(),

    String(
      formData.get("email") || ""
    ).trim().toLowerCase(),

    String(
      formData.get("phone") || ""
    ).replace(/\D/g, ""),

    String(
      formData.get("service") || ""
    ).trim(),

    String(
      formData.get("message") || ""
    ).trim().toLowerCase()
  ].join("|");

  return hashString(
    fingerprintSource
  );
}


/*
  Hash sederhana untuk pembanding lokal

  Ini bukan hash untuk password
  atau data keamanan tingkat tinggi.
*/

function hashString(value) {
  let hash = 2166136261;

  for (
    let index = 0;
    index < value.length;
    index += 1
  ) {
    hash ^= value.charCodeAt(index);

    hash =
      Math.imul(
        hash,
        16777619
      );
  }

  return (
    hash >>> 0
  ).toString(16);
}


/*
  Mengecek pengiriman data sama
  dalam 60 detik terakhir
*/

function getDuplicateWaitSeconds(
  fingerprint
) {
  try {
    const storedValue =
      localStorage.getItem(
        RECENT_SUBMISSION_STORAGE_KEY
      );

    if (!storedValue) {
      return 0;
    }

    const recentSubmission =
      JSON.parse(storedValue);

    if (
      recentSubmission.fingerprint !==
      fingerprint
    ) {
      return 0;
    }

    const elapsedTime =
      Date.now() -
      Number(
        recentSubmission.timestamp
      );

    if (!Number.isFinite(elapsedTime)) {
      return 0;
    }

    const remainingTime =
      DUPLICATE_WINDOW_MS -
      elapsedTime;

    if (remainingTime <= 0) {
      localStorage.removeItem(
        RECENT_SUBMISSION_STORAGE_KEY
      );

      return 0;
    }

    return Math.ceil(
      remainingTime / 1000
    );

  } catch (error) {
    console.warn(
      "Pemeriksaan duplikat lokal gagal.",
      error
    );

    return 0;
  }
}


/*
  Menyimpan fingerprint pengiriman terakhir
*/

function saveRecentSubmission(
  fingerprint
) {
  try {
    localStorage.setItem(
      RECENT_SUBMISSION_STORAGE_KEY,
      JSON.stringify({
        fingerprint: fingerprint,
        timestamp: Date.now()
      })
    );

  } catch (error) {
    console.warn(
      "Browser tidak dapat menyimpan riwayat pengiriman.",
      error
    );
  }
}
