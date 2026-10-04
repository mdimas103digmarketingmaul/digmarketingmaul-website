
(function(){
  const html = document.documentElement;
  const saved = localStorage.getItem("maulAdminTheme");
  html.dataset.theme = saved === "dark" ? "dark" : "light";

  window.Admin = {
    escapeHtml(value){
      return String(value ?? "")
        .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;").replace(/'/g,"&#039;");
    },
    formatDate(value){
      if(!value) return "—";
      const raw = String(value);
      const date = new Date(raw.includes("T") ? raw : raw.replace(" ","T")+"Z");
      if(Number.isNaN(date.getTime())) return raw;
      return new Intl.DateTimeFormat("id-ID",{
        dateStyle:"medium",timeStyle:"short",timeZone:"Asia/Jakarta"
      }).format(date);
    },
    formatIdr(value){
      return new Intl.NumberFormat("id-ID",{
        style:"currency",currency:"IDR",maximumFractionDigits:0
      }).format(Number(value||0));
    },
    riskLabel(value){
      const v=String(value||"NORMAL").toUpperCase();
      if(v==="HIGH_ACTIVITY") return "High activity";
      if(v==="REVIEW") return "Review";
      return "Normal";
    },
    sourceLabel(value){
      const v=String(value||"MANUAL").toUpperCase();
      return ({PAID:"Paid",GIFT:"Gift",MANUAL:"Manual",PROMO:"Promo"})[v]||v;
    },
    device(value){
      const ua=String(value||"");
      let browser="Browser";
      if(/Edg\//.test(ua)) browser="Edge";
      else if(/Chrome\//.test(ua)&&!/Chromium/.test(ua)) browser="Chrome";
      else if(/Safari\//.test(ua)&&!/Chrome\//.test(ua)) browser="Safari";
      else if(/Firefox\//.test(ua)) browser="Firefox";
      let os="Unknown device";
      if(/iPhone/.test(ua)) os="iPhone";
      else if(/iPad/.test(ua)) os="iPad";
      else if(/Macintosh|Mac OS X/.test(ua)) os="Mac";
      else if(/Windows/.test(ua)) os="Windows";
      else if(/Android/.test(ua)) os="Android";
      else if(/Linux/.test(ua)) os="Linux";
      return `${browser} · ${os}`;
    },
    async api(url, options={}){
      const init={cache:"no-store",...options,headers:{...(options.headers||{})}};
      if(init.body && !init.headers["Content-Type"]) init.headers["Content-Type"]="application/json";
      const res=await fetch(url,init);
      let data;
      try{data=await res.json()}catch{data={success:false,error:`HTTP ${res.status}`}}
      if(!res.ok || data.success===false){
        const err=new Error(data.error||data.message||`HTTP ${res.status}`);
        err.data=data; err.status=res.status; throw err;
      }
      return data;
    },
    post(url, body){ return this.api(url,{method:"POST",body:JSON.stringify(body)}); },
    toast(message,type="ok"){
      let el=document.getElementById("admin-toast");
      if(!el){
        el=document.createElement("div"); el.id="admin-toast"; el.className="toast";
        document.body.appendChild(el);
      }
      el.textContent=message; el.className=`toast ${type==="error"?"error":""} show`;
      clearTimeout(el._timer);
      el._timer=setTimeout(()=>el.classList.remove("show"),3600);
    },
    debounce(fn,wait=300){
      let t; return (...args)=>{clearTimeout(t);t=setTimeout(()=>fn(...args),wait)};
    },
    setAdminEmail(email){
      document.querySelectorAll("[data-admin-email]").forEach(el=>el.textContent=email||"");
    }
  };

  document.addEventListener("DOMContentLoaded",()=>{
    const themeButton=document.getElementById("theme-button");
    const setTheme=(theme)=>{
      const next=theme==="dark"?"dark":"light";
      html.dataset.theme=next;
      localStorage.setItem("maulAdminTheme",next);
      if(themeButton) themeButton.textContent=next==="dark"?"Light mode":"Dark mode";
    };
    setTheme(html.dataset.theme);
    themeButton?.addEventListener("click",()=>{
      setTheme(html.dataset.theme==="dark"?"light":"dark");
    });

    const path=location.pathname.replace(/\/+$/,"")||"/";
    document.querySelectorAll(".nav a[data-nav]").forEach(a=>{
      const target=(a.getAttribute("href")||"").replace(/\/+$/,"");
      if(target && (path===target || (target!=="/admin" && path.startsWith(target+"/")))){
        a.classList.add("active");
      }
    });
  });
})();
