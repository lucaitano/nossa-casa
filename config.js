/* Nossa Casa — configuração do app instalável.
   Troque os valores entre aspas pelos de vocês (o passo a passo está no LEIA-ME). */
window.NC = {
  /* Endereço do app no Apps Script (Implantar > Gerenciar implantações > URL do app da Web, termina em /exec) */
  app: 'https://script.google.com/macros/s/AKfycbyn_MhWBml__8xTHy5L1I4GBLk0q-XCdi-cFReD8E0ImrJgtX4tBlmbB-kXX6wAG6Hi/exec',

  /* Firebase > Configurações do projeto > Seus apps > App da Web > "firebaseConfig" */
  firebase: {
    apiKey: "AIzaSyCWTcMla2OnZqdKceXr4zt5klMDIJxl4WU",
   authDomain: "nossa--casa.firebaseapp.com",
   projectId: "nossa--casa",
   storageBucket: "nossa--casa.firebasestorage.app",
   messagingSenderId: "31899385197",
   appId: "1:31899385197:web:2b9adecd3a3ce5eb9f2e64"
},

  /* Firebase > Configurações do projeto > Cloud Messaging > Certificados push da Web > Par de chaves */
  vapid: 'BOHOKP5UtIUcliZrV50g8a1siX5CGvOHXJPLGhpBbgzUr7TKkyccSylP2_9_EPahO3vESlBytxygOPXdeO20hb4'
};
