export type ICompanyDataFromAPI = {
  dati_anagrafici: {
    id_soggetto: number;
    denominazione: string;
    codice_fiscale: string;
    partita_iva: string;
    indirizzo: {
      descrizione: string;
      cap: string;
      codice_comune: string;
      descrizione_comune: string;
      codice_comune_istat: string;
      provincia: string;
      descrizione_provincia: string;
    };
  };
  dati_attivita: {
    codice_ateco: string;
    ateco: string;
    codice_ateco_infocamere: string;
    ateco_infocamere: string;
    codice_stato_attivita: string;
    flag_operativa: boolean;
    codice_rea: string;
    data_iscrizione_rea: string;
    dati_no_rea: {
      codice_forma: string;
      descrizione_forma: string;
    };
    company_form: {
      code: string;
      description: string;
      company_form_class: string;
    };
  };
  dati_pa: {
    ente: boolean;
    fornitore: boolean;
    partecipata: boolean;
  };
};
