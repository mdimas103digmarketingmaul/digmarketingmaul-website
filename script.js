const WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbzoUCYE_rtwDtkgZFSxXOvOOjfL09ixnhy5dFfuzjitjk0irxWwMPWRRDoXP7Z5x0RPtw/exec";

document.addEventListener("DOMContentLoaded", function () {
  setupDemoButton();
  populateAttributionFields();
  setupLeadForm();

  console.log("Website Dig Marketing Maul berhasil dimuat.");
});


/*
  Demo tombol JavaScript
*/

function setupDemoButton() {
  const actionButton = document.getElementById("actionButton");
  const message = document.getElementById("message");

  if (!actionButton || !message) {
    return;
  }

  actionButton.addEventListener("click", function () {
    message.textContent =
      "Tombol berhasil diklik. JavaScript sedang bekerja!";

    actionButton.textContent = "Berhasil Diklik";
  });
}


/*
  Menyimpan UTM dan GCLID di browser
*/

function populateAttributionFields() {
  const urlParameters = new URLSearchParams(window.location.search);

  const attributionFields = {
    utm_source: "utmSource",
    utm_medium: "utmMedium",
    utm_campaign: "utmCampaign",
    gclid: "gclid"
  };

  Object.entries(attributionFields).forEach(
    function ([parameterName, fieldId]) {
      const parameterValue = urlParameters.get(parameterName);

      if (parameterValue) {
        saveToLocalStorage(parameterName, parameterValue);
      }

      const storedValue =
        parameterValue ||
        getFromLocalStorage(parameterName) ||
        "";

      const hiddenField = document.getElementById(fieldId);

      if (hiddenField) {
        hiddenField.value = storedValue;
      }
    }
  );

  let landingPage = getFromLocalStorage("landing_page");

  if (!landingPage) {
    landingPage = window.location.href;
    saveToLocalStorage("landing_page", landingPage);
  }

  const landingPageField =
    document.getElementById("landingPage");

  if (landingPageField) {
    landingPageField.value = landingPage;
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
  Mengirim form ke Google Apps Script
*/

function setupLeadForm() {
  const leadForm = document.getElementById("leadForm");
  const submitButton =
    document.getElementById("submitButton");
  const formStatus =
    document.getElementById("formStatus");

  if (!leadForm || !submitButton || !formStatus) {
    return;
  }

  leadForm.addEventListener(
    "submit",
    async function (event) {
      event.preventDefault();

      if (!leadForm.reportValidity()) {
        return;
      }

      populateAttributionFields();

      submitButton.disabled = true;
      submitButton.textContent = "Sedang Mengirim...";

      formStatus.textContent = "";
      formStatus.className = "form-status";

      const formData = new FormData(leadForm);
      const requestBody = new URLSearchParams();

      formData.forEach(function (value, key) {
        requestBody.append(key, String(value));
      });

      try {
        await fetch(WEB_APP_URL, {
          method: "POST",
          mode: "no-cors",
          body: requestBody
        });

        formStatus.textContent =
          "Terima kasih. Permintaan Anda telah dikirim.";

        formStatus.classList.add("success");

        leadForm.reset();

        // Mengisi kembali UTM dan GCLID setelah form di-reset.
        populateAttributionFields();

      } catch (error) {
        console.error(
          "Form gagal dikirim:",
          error
        );

        formStatus.textContent =
          "Data belum berhasil dikirim. Silakan coba kembali.";

        formStatus.classList.add("error");

      } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Kirim Permintaan";
      }
    }
  );
}
