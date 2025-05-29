

export enum ViewMode {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export enum Theme {
  LIGHT = 'LIGHT',
  DARK = 'DARK',
}

export enum ActivityType {
  EVENT = 'Evento', // Changed to Portuguese
  TASK = 'Tarefa', // Changed to Portuguese
  BIRTHDAY = 'Aniversário', // Changed to Portuguese
}

export enum RecurrenceOption {
  NONE = "Não se repete",
  DAILY = "Todos os dias",
  WEEKLY = "Toda semana",
  MONTHLY = "Todo mês",
  YEARLY = "Todo ano",
  CUSTOM = "Personalizado..."
}

export const RECURRENCE_OPTIONS_PT: RecurrenceOption[] = [
  RecurrenceOption.NONE,
  RecurrenceOption.DAILY,
  RecurrenceOption.WEEKLY,
  RecurrenceOption.MONTHLY,
  RecurrenceOption.YEARLY,
  RecurrenceOption.CUSTOM,
];


export interface Activity {
  id: string;
  date: string; // YYYY-MM-DD (represents the start date)
  title: string;
  isAllDay: boolean;
  startTime?: string; // HH:MM, only if not allDay
  endTime?: string; // HH:MM, only if not allDay and has a specific end time
  location?: string;
  description?: string;
  categoryColor: string;
  activityType: ActivityType;
  recurrenceRule?: RecurrenceOption; // Added for recurrence
}

export enum HolidayType {
  NATIONAL = 'NATIONAL',
  SAINT = 'SAINT',
  COMMEMORATIVE = 'COMMEMORATIVE',
}

// This interface is used for National Holidays, Saint Days, and Commemorative Dates.
// For National Holidays, date is 'YYYY-MM-DD'.
// For Saint Days, date is 'MM-DD' (to apply to all years).
// For Commemorative Dates fetched from API, date will be 'YYYY-MM-DD'.
export interface Holiday {
  date: string;
  name: string;
  type: HolidayType;
}

export const MONTH_NAMES_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export const DAY_ABBREVIATIONS_PT = ["D", "S", "T", "Q", "Q", "S", "S"]; // Sunday first

export const DAY_NAMES_PT = [
  "Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"
];

// TODO: Preencher completamente os feriados nacionais para o intervalo de [ano_atual - 20] até [ano_atual + 20].
// Exemplo: Se o ano atual é 2024, preencher de 2004 até 2044.
// Abaixo, uma amostra para ilustração.
export const MOCK_NATIONAL_HOLIDAYS_PT_BR: Holiday[] = [
  // --- Amostra Passado Distante (ex: 2004) ---
  { date: '2004-01-01', name: 'Confraternização Universal', type: HolidayType.NATIONAL },
  { date: '2004-02-24', name: 'Carnaval (Ponto Facultativo Nacional)', type: HolidayType.NATIONAL },
  { date: '2004-04-09', name: 'Sexta-feira Santa', type: HolidayType.NATIONAL },
  { date: '2004-04-21', name: 'Tiradentes', type: HolidayType.NATIONAL },
  { date: '2004-05-01', name: 'Dia do Trabalho', type: HolidayType.NATIONAL },
  { date: '2004-06-10', name: 'Corpus Christi (Ponto Facultativo Nacional)', type: HolidayType.NATIONAL },
  { date: '2004-09-07', name: 'Independência do Brasil', type: HolidayType.NATIONAL },
  { date: '2004-10-12', name: 'Nossa Senhora Aparecida', type: HolidayType.NATIONAL },
  { date: '2004-11-02', name: 'Finados', type: HolidayType.NATIONAL },
  { date: '2004-11-15', name: 'Proclamação da República', type: HolidayType.NATIONAL },
  { date: '2004-12-25', name: 'Natal', type: HolidayType.NATIONAL },

  // --- Amostra Passado Recente (ex: 2023) ---
  { date: '2023-01-01', name: 'Confraternização Universal', type: HolidayType.NATIONAL },
  { date: '2023-02-21', name: 'Carnaval (Ponto Facultativo Nacional)', type: HolidayType.NATIONAL },
  { date: '2023-04-07', name: 'Sexta-feira Santa', type: HolidayType.NATIONAL },
  { date: '2023-04-21', name: 'Tiradentes', type: HolidayType.NATIONAL },
  { date: '2023-05-01', name: 'Dia do Trabalho', type: HolidayType.NATIONAL },
  { date: '2023-06-08', name: 'Corpus Christi (Ponto Facultativo Nacional)', type: HolidayType.NATIONAL },
  { date: '2023-09-07', name: 'Independência do Brasil', type: HolidayType.NATIONAL },
  { date: '2023-10-12', name: 'Nossa Senhora Aparecida', type: HolidayType.NATIONAL },
  { date: '2023-11-02', name: 'Finados', type: HolidayType.NATIONAL },
  { date: '2023-11-15', name: 'Proclamação da República', type: HolidayType.NATIONAL },
  { date: '2023-12-25', name: 'Natal', type: HolidayType.NATIONAL },

  // --- Dados Existentes (2024, 2025, 2026) ---
  { date: '2024-01-01', name: 'Confraternização Universal', type: HolidayType.NATIONAL },
  { date: '2024-03-29', name: 'Sexta-feira Santa', type: HolidayType.NATIONAL }, // Carnaval 2024: 13/02 (Ponto Facultativo)
  { date: '2024-02-13', name: 'Carnaval (Ponto Facultativo Nacional)', type: HolidayType.NATIONAL },
  { date: '2024-04-21', name: 'Tiradentes', type: HolidayType.NATIONAL },
  { date: '2024-05-01', name: 'Dia do Trabalho', type: HolidayType.NATIONAL },
  { date: '2024-05-30', name: 'Corpus Christi (Ponto Facultativo Nacional)', type: HolidayType.NATIONAL },
  { date: '2024-09-07', name: 'Independência do Brasil', type: HolidayType.NATIONAL },
  { date: '2024-10-12', name: 'Nossa Senhora Aparecida', type: HolidayType.NATIONAL },
  { date: '2024-11-02', name: 'Finados', type: HolidayType.NATIONAL },
  { date: '2024-11-15', name: 'Proclamação da República', type: HolidayType.NATIONAL },
  { date: '2024-12-25', name: 'Natal', type: HolidayType.NATIONAL },

  { date: '2025-01-01', name: 'Confraternização Universal', type: HolidayType.NATIONAL },
  { date: '2025-03-04', name: 'Carnaval (Ponto Facultativo Nacional)', type: HolidayType.NATIONAL },
  { date: '2025-04-18', name: 'Sexta-feira Santa', type: HolidayType.NATIONAL },
  { date: '2025-04-21', name: 'Tiradentes', type: HolidayType.NATIONAL },
  { date: '2025-05-01', name: 'Dia do Trabalho', type: HolidayType.NATIONAL },
  { date: '2025-06-19', name: 'Corpus Christi (Ponto Facultativo Nacional)', type: HolidayType.NATIONAL },
  { date: '2025-09-07', name: 'Independência do Brasil', type: HolidayType.NATIONAL },
  { date: '2025-10-12', name: 'Nossa Senhora Aparecida', type: HolidayType.NATIONAL },
  { date: '2025-11-02', name: 'Finados', type: HolidayType.NATIONAL },
  { date: '2025-11-15', name: 'Proclamação da República', type: HolidayType.NATIONAL },
  { date: '2025-12-25', name: 'Natal', type: HolidayType.NATIONAL },

  { date: '2026-01-01', name: 'Confraternização Universal', type: HolidayType.NATIONAL },
  { date: '2026-02-17', name: 'Carnaval (Ponto Facultativo Nacional)', type: HolidayType.NATIONAL },
  { date: '2026-04-03', name: 'Sexta-feira Santa', type: HolidayType.NATIONAL },
  { date: '2026-04-21', name: 'Tiradentes', type: HolidayType.NATIONAL },
  { date: '2026-05-01', name: 'Dia do Trabalho', type: HolidayType.NATIONAL },
  { date: '2026-06-04', name: 'Corpus Christi (Ponto Facultativo Nacional)', type: HolidayType.NATIONAL },
  { date: '2026-09-07', name: 'Independência do Brasil', type: HolidayType.NATIONAL },
  { date: '2026-10-12', name: 'Nossa Senhora Aparecida', type: HolidayType.NATIONAL },
  { date: '2026-11-02', name: 'Finados', type: HolidayType.NATIONAL },
  { date: '2026-11-15', name: 'Proclamação da República', type: HolidayType.NATIONAL },
  { date: '2026-12-25', name: 'Natal', type: HolidayType.NATIONAL },

  // --- Amostra Futuro Próximo (ex: 2027) ---
  { date: '2027-01-01', name: 'Confraternização Universal', type: HolidayType.NATIONAL },
  { date: '2027-02-09', name: 'Carnaval (Ponto Facultativo Nacional)', type: HolidayType.NATIONAL },
  { date: '2027-03-26', name: 'Sexta-feira Santa', type: HolidayType.NATIONAL },
  { date: '2027-04-21', name: 'Tiradentes', type: HolidayType.NATIONAL },
  { date: '2027-05-01', name: 'Dia do Trabalho', type: HolidayType.NATIONAL },
  { date: '2027-05-27', name: 'Corpus Christi (Ponto Facultativo Nacional)', type: HolidayType.NATIONAL },
  { date: '2027-09-07', name: 'Independência do Brasil', type: HolidayType.NATIONAL },
  { date: '2027-10-12', name: 'Nossa Senhora Aparecida', type: HolidayType.NATIONAL },
  { date: '2027-11-02', name: 'Finados', type: HolidayType.NATIONAL },
  { date: '2027-11-15', name: 'Proclamação da República', type: HolidayType.NATIONAL },
  { date: '2027-12-25', name: 'Natal', type: HolidayType.NATIONAL },

  // --- Amostra Futuro Distante (ex: 2044) ---
  { date: '2044-01-01', name: 'Confraternização Universal', type: HolidayType.NATIONAL },
  { date: '2044-02-16', name: 'Carnaval (Ponto Facultativo Nacional)', type: HolidayType.NATIONAL },
  { date: '2044-04-01', name: 'Sexta-feira Santa', type: HolidayType.NATIONAL },
  { date: '2044-04-21', name: 'Tiradentes', type: HolidayType.NATIONAL },
  { date: '2044-05-01', name: 'Dia do Trabalho', type: HolidayType.NATIONAL },
  { date: '2044-06-02', name: 'Corpus Christi (Ponto Facultativo Nacional)', type: HolidayType.NATIONAL },
  { date: '2044-09-07', name: 'Independência do Brasil', type: HolidayType.NATIONAL },
  { date: '2044-10-12', name: 'Nossa Senhora Aparecida', type: HolidayType.NATIONAL },
  { date: '2044-11-02', name: 'Finados', type: HolidayType.NATIONAL },
  { date: '2044-11-15', name: 'Proclamação da República', type: HolidayType.NATIONAL },
  { date: '2044-12-25', name: 'Natal', type: HolidayType.NATIONAL },
];

export const MOCK_SAINT_DAYS_PT_BR: Holiday[] = [
  // Formato MM-DD para aparecer em todos os anos
  // Janeiro
  { date: '01-01', name: 'Santa Maria, Mãe de Deus', type: HolidayType.SAINT },
  { date: '01-17', name: 'Santo Antão, abade', type: HolidayType.SAINT },
  { date: '01-20', name: 'São Sebastião, mártir', type: HolidayType.SAINT },
  { date: '01-21', name: 'Santa Inês, virgem e mártir', type: HolidayType.SAINT },
  { date: '01-24', name: 'São Francisco de Sales, bispo e doutor', type: HolidayType.SAINT },
  { date: '01-25', name: 'Conversão de São Paulo, apóstolo', type: HolidayType.SAINT },
  { date: '01-28', name: 'São Tomás de Aquino, presbítero e doutor', type: HolidayType.SAINT },
  { date: '01-31', name: 'São João Bosco, presbítero', type: HolidayType.SAINT },

  // Fevereiro
  { date: '02-02', name: 'Apresentação do Senhor (Nossa Senhora da Candelária / dos Navegantes)', type: HolidayType.SAINT },
  { date: '02-03', name: 'São Brás, bispo e mártir', type: HolidayType.SAINT },
  { date: '02-05', name: 'Santa Águeda, virgem e mártir', type: HolidayType.SAINT },
  { date: '02-11', name: 'Nossa Senhora de Lourdes', type: HolidayType.SAINT },
  { date: '02-14', name: 'São Cirilo e São Metódio; São Valentim', type: HolidayType.SAINT },
  { date: '02-22', name: 'Cátedra de São Pedro, apóstolo', type: HolidayType.SAINT },

  // Março
  { date: '03-07', name: 'Santas Perpétua e Felicidade, mártires', type: HolidayType.SAINT },
  { date: '03-17', name: 'São Patrício, bispo', type: HolidayType.SAINT },
  { date: '03-19', name: 'São José, esposo da Virgem Maria', type: HolidayType.SAINT },
  { date: '03-25', name: 'Anunciação do Senhor', type: HolidayType.SAINT },

  // Abril
  { date: '04-23', name: 'São Jorge, mártir', type: HolidayType.SAINT },
  { date: '04-25', name: 'São Marcos, evangelista', type: HolidayType.SAINT },
  { date: '04-29', name: 'Santa Catarina de Sena, virgem e doutora', type: HolidayType.SAINT },

  // Maio
  { date: '05-01', name: 'São José Operário', type: HolidayType.SAINT },
  { date: '05-03', name: 'São Filipe e São Tiago Menor, apóstolos', type: HolidayType.SAINT },
  { date: '05-13', name: 'Nossa Senhora de Fátima', type: HolidayType.SAINT },
  { date: '05-14', name: 'São Matias, apóstolo', type: HolidayType.SAINT },
  { date: '05-15', name: 'Santo Isidoro Lavrador', type: HolidayType.SAINT },
  { date: '05-22', name: 'Santa Rita de Cássia, religiosa', type: HolidayType.SAINT },
  { date: '05-26', name: 'São Filipe Néri, presbítero', type: HolidayType.SAINT },
  { date: '05-30', name: 'Santa Joana d\'Arc, virgem', type: HolidayType.SAINT },
  { date: '05-31', name: 'Visitação de Nossa Senhora', type: HolidayType.SAINT },

  // Junho
  { date: '06-01', name: 'São Justino, mártir', type: HolidayType.SAINT },
  { date: '06-03', name: 'São Carlos Lwanga e companheiros, mártires', type: HolidayType.SAINT },
  { date: '06-11', name: 'São Barnabé, apóstolo', type: HolidayType.SAINT },
  { date: '06-13', name: 'Santo Antônio de Pádua (ou de Lisboa), presbítero e doutor', type: HolidayType.SAINT },
  { date: '06-21', name: 'São Luís Gonzaga, religioso', type: HolidayType.SAINT },
  { date: '06-24', name: 'Natividade de São João Batista', type: HolidayType.SAINT },
  { date: '06-29', name: 'São Pedro e São Paulo, apóstolos', type: HolidayType.SAINT },

  // Julho
  { date: '07-03', name: 'São Tomé, apóstolo', type: HolidayType.SAINT },
  { date: '07-11', name: 'São Bento de Núrsia, abade', type: HolidayType.SAINT },
  { date: '07-16', name: 'Nossa Senhora do Carmo', type: HolidayType.SAINT },
  { date: '07-22', name: 'Santa Maria Madalena', type: HolidayType.SAINT },
  { date: '07-25', name: 'São Tiago Maior, apóstolo', type: HolidayType.SAINT },
  { date: '07-26', name: 'Sant’Ana e São Joaquim, pais da Virgem Maria', type: HolidayType.SAINT },
  { date: '07-31', name: 'Santo Inácio de Loyola, presbítero', type: HolidayType.SAINT },

  // Agosto
  { date: '08-04', name: 'São João Maria Vianney (Cura d\'Ars), presbítero', type: HolidayType.SAINT },
  { date: '08-06', name: 'Transfiguração do Senhor', type: HolidayType.SAINT },
  { date: '08-08', name: 'São Domingos de Gusmão, presbítero', type: HolidayType.SAINT },
  { date: '08-10', name: 'São Lourenço, diácono e mártir', type: HolidayType.SAINT },
  { date: '08-11', name: 'Santa Clara de Assis, virgem', type: HolidayType.SAINT },
  { date: '08-15', name: 'Assunção de Nossa Senhora', type: HolidayType.SAINT },
  { date: '08-20', name: 'São Bernardo de Claraval, abade e doutor', type: HolidayType.SAINT },
  { date: '08-23', name: 'Santa Rosa de Lima, virgem', type: HolidayType.SAINT },
  { date: '08-24', name: 'São Bartolomeu, apóstolo', type: HolidayType.SAINT },
  { date: '08-27', name: 'Santa Mônica', type: HolidayType.SAINT },
  { date: '08-28', name: 'Santo Agostinho, bispo e doutor', type: HolidayType.SAINT },
  { date: '08-29', name: 'Martírio de São João Batista', type: HolidayType.SAINT },

  // Setembro
  { date: '09-03', name: 'São Gregório Magno, papa e doutor', type: HolidayType.SAINT },
  { date: '09-08', name: 'Natividade de Nossa Senhora', type: HolidayType.SAINT },
  { date: '09-14', name: 'Exaltação da Santa Cruz', type: HolidayType.SAINT },
  { date: '09-15', name: 'Nossa Senhora das Dores', type: HolidayType.SAINT },
  { date: '09-21', name: 'São Mateus, apóstolo e evangelista', type: HolidayType.SAINT },
  { date: '09-23', name: 'São Pio de Pietrelcina (Padre Pio), presbítero', type: HolidayType.SAINT },
  { date: '09-27', name: 'São Vicente de Paulo, presbítero', type: HolidayType.SAINT },
  { date: '09-29', name: 'São Miguel, São Gabriel e São Rafael, arcanjos', type: HolidayType.SAINT },
  { date: '09-30', name: 'São Jerônimo, presbítero e doutor', type: HolidayType.SAINT },

  // Outubro
  { date: '10-01', name: 'Santa Teresinha do Menino Jesus, virgem e doutora', type: HolidayType.SAINT },
  { date: '10-02', name: 'Santos Anjos da Guarda', type: HolidayType.SAINT },
  { date: '10-04', name: 'São Francisco de Assis', type: HolidayType.SAINT },
  { date: '10-07', name: 'Nossa Senhora do Rosário', type: HolidayType.SAINT },
  { date: '10-12', name: 'Nossa Senhora Aparecida (Padroeira do Brasil)', type: HolidayType.SAINT },
  { date: '10-15', name: 'Santa Teresa de Jesus (de Ávila), virgem e doutora', type: HolidayType.SAINT },
  { date: '10-16', name: 'Santa Edviges, religiosa; Santa Margarida Maria Alacoque, virgem', type: HolidayType.SAINT },
  { date: '10-18', name: 'São Lucas, evangelista', type: HolidayType.SAINT },
  { date: '10-22', name: 'São João Paulo II, papa', type: HolidayType.SAINT },
  { date: '10-28', name: 'São Simão e São Judas Tadeu, apóstolos', type: HolidayType.SAINT },

  // Novembro
  { date: '11-01', name: 'Todos os Santos', type: HolidayType.SAINT },
  { date: '11-02', name: 'Comemoração de Todos os Fiéis Defuntos (Finados)', type: HolidayType.SAINT },
  { date: '11-03', name: 'São Martinho de Lima, religioso', type: HolidayType.SAINT },
  { date: '11-11', name: 'São Martinho de Tours, bispo', type: HolidayType.SAINT },
  { date: '11-17', name: 'Santa Isabel da Hungria, religiosa', type: HolidayType.SAINT },
  { date: '11-21', name: 'Apresentação de Nossa Senhora', type: HolidayType.SAINT },
  { date: '11-22', name: 'Santa Cecília, virgem e mártir', type: HolidayType.SAINT },
  { date: '11-25', name: 'Santa Catarina de Alexandria, virgem e mártir', type: HolidayType.SAINT },
  { date: '11-30', name: 'Santo André, apóstolo', type: HolidayType.SAINT },

  // Dezembro
  { date: '12-03', name: 'São Francisco Xavier, presbítero', type: HolidayType.SAINT },
  { date: '12-06', name: 'São Nicolau, bispo', type: HolidayType.SAINT },
  { date: '12-07', name: 'Santo Ambrósio, bispo e doutor', type: HolidayType.SAINT },
  { date: '12-08', name: 'Imaculada Conceição de Nossa Senhora', type: HolidayType.SAINT },
  { date: '12-09', name: 'São João Diego Cuauhtlatoatzin', type: HolidayType.SAINT },
  { date: '12-12', name: 'Nossa Senhora de Guadalupe', type: HolidayType.SAINT },
  { date: '12-13', name: 'Santa Luzia, virgem e mártir', type: HolidayType.SAINT },
  { date: '12-14', name: 'São João da Cruz, presbítero e doutor', type: HolidayType.SAINT },
  { date: '12-25', name: 'Natal do Senhor', type: HolidayType.SAINT },
  { date: '12-26', name: 'Santo Estêvão, primeiro mártir', type: HolidayType.SAINT },
  { date: '12-27', name: 'São João, apóstolo e evangelista', type: HolidayType.SAINT },
  { date: '12-28', name: 'Santos Inocentes, mártires', type: HolidayType.SAINT },
  { date: '12-29', name: 'São Tomás Becket, bispo e mártir', type: HolidayType.SAINT },
];

// TODO: Preencher completamente as datas comemorativas para o intervalo de [ano_atual - 20] até [ano_atual + 20].
// Exemplo: Se o ano atual é 2024, preencher de 2004 até 2044.
// Incluir datas como Dia das Mães, Dia dos Pais, etc. (excluindo feriados nacionais já listados).
// Abaixo, uma amostra para ilustração com datas fixas comuns.
export const MOCK_COMMEMORATIVE_DATES_PT_BR: Holiday[] = [
  // --- Amostra 2004 ---
  { date: '2004-03-08', name: 'Dia Internacional da Mulher', type: HolidayType.COMMEMORATIVE },
  { date: '2004-05-09', name: 'Dia das Mães', type: HolidayType.COMMEMORATIVE }, // Exemplo Dia das Mães (2º Dom de Maio)
  { date: '2004-06-12', name: 'Dia dos Namorados', type: HolidayType.COMMEMORATIVE },
  { date: '2004-07-20', name: 'Dia do Amigo', type: HolidayType.COMMEMORATIVE },
  { date: '2004-08-08', name: 'Dia dos Pais', type: HolidayType.COMMEMORATIVE }, // Exemplo Dia dos Pais (2º Dom de Agosto)
  { date: '2004-10-12', name: 'Dia das Crianças', type: HolidayType.COMMEMORATIVE }, // Coincide com feriado, mas é comemorativa importante

  // --- Amostra 2023 ---
  { date: '2023-03-08', name: 'Dia Internacional da Mulher', type: HolidayType.COMMEMORATIVE },
  { date: '2023-05-14', name: 'Dia das Mães', type: HolidayType.COMMEMORATIVE },
  { date: '2023-06-12', name: 'Dia dos Namorados', type: HolidayType.COMMEMORATIVE },
  { date: '2023-07-20', name: 'Dia do Amigo', type: HolidayType.COMMEMORATIVE },
  { date: '2023-08-13', name: 'Dia dos Pais', type: HolidayType.COMMEMORATIVE },
  { date: '2023-10-12', name: 'Dia das Crianças', type: HolidayType.COMMEMORATIVE },

  // --- Amostra 2024 ---
  { date: '2024-03-08', name: 'Dia Internacional da Mulher', type: HolidayType.COMMEMORATIVE },
  { date: '2024-05-12', name: 'Dia das Mães', type: HolidayType.COMMEMORATIVE },
  { date: '2024-06-12', name: 'Dia dos Namorados', type: HolidayType.COMMEMORATIVE },
  { date: '2024-07-20', name: 'Dia do Amigo', type: HolidayType.COMMEMORATIVE },
  { date: '2024-08-11', name: 'Dia dos Pais', type: HolidayType.COMMEMORATIVE },
  { date: '2024-10-12', name: 'Dia das Crianças', type: HolidayType.COMMEMORATIVE },

  // --- Amostra 2025 ---
  { date: '2025-03-08', name: 'Dia Internacional da Mulher', type: HolidayType.COMMEMORATIVE },
  { date: '2025-05-11', name: 'Dia das Mães', type: HolidayType.COMMEMORATIVE },
  { date: '2025-06-12', name: 'Dia dos Namorados', type: HolidayType.COMMEMORATIVE },
  { date: '2025-07-20', name: 'Dia do Amigo', type: HolidayType.COMMEMORATIVE },
  { date: '2025-08-10', name: 'Dia dos Pais', type: HolidayType.COMMEMORATIVE },
  { date: '2025-10-12', name: 'Dia das Crianças', type: HolidayType.COMMEMORATIVE },

  // --- Amostra 2026 ---
  { date: '2026-03-08', name: 'Dia Internacional da Mulher', type: HolidayType.COMMEMORATIVE },
  { date: '2026-05-10', name: 'Dia das Mães', type: HolidayType.COMMEMORATIVE },
  { date: '2026-06-12', name: 'Dia dos Namorados', type: HolidayType.COMMEMORATIVE },
  { date: '2026-07-20', name: 'Dia do Amigo', type: HolidayType.COMMEMORATIVE },
  { date: '2026-08-09', name: 'Dia dos Pais', type: HolidayType.COMMEMORATIVE },
  { date: '2026-10-12', name: 'Dia das Crianças', type: HolidayType.COMMEMORATIVE },

  // --- Amostra 2027 ---
  { date: '2027-03-08', name: 'Dia Internacional da Mulher', type: HolidayType.COMMEMORATIVE },
  { date: '2027-05-09', name: 'Dia das Mães', type: HolidayType.COMMEMORATIVE },
  { date: '2027-06-12', name: 'Dia dos Namorados', type: HolidayType.COMMEMORATIVE },
  { date: '2027-07-20', name: 'Dia do Amigo', type: HolidayType.COMMEMORATIVE },
  { date: '2027-08-08', name: 'Dia dos Pais', type: HolidayType.COMMEMORATIVE },
  { date: '2027-10-12', name: 'Dia das Crianças', type: HolidayType.COMMEMORATIVE },

  // --- Amostra 2044 ---
  { date: '2044-03-08', name: 'Dia Internacional da Mulher', type: HolidayType.COMMEMORATIVE },
  { date: '2044-05-08', name: 'Dia das Mães', type: HolidayType.COMMEMORATIVE },
  { date: '2044-06-12', name: 'Dia dos Namorados', type: HolidayType.COMMEMORATIVE },
  { date: '2044-07-20', name: 'Dia do Amigo', type: HolidayType.COMMEMORATIVE },
  { date: '2044-08-14', name: 'Dia dos Pais', type: HolidayType.COMMEMORATIVE },
  { date: '2044-10-12', name: 'Dia das Crianças', type: HolidayType.COMMEMORATIVE },
];


export const MOCK_ACTIVITIES: Activity[] = [];