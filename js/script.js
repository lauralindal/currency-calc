$(function() {

   // Variablen
   var api_url = 'http://localhost/Wechselkursrechner/api/';
   var fav_currencies = ['EUR', 'USD', 'GBP', 'CHF', 'ILS', 'CNY', 'JPY', 'SGD'];
   var currencies = window.currencies;
   var rates = {};
   // verschiedene Wege, an die gewünschten DOM-Elemente zu kommen
   var overview = document.querySelector('.overview');
   var select_from = document.querySelector('select[name="from-currency"]');
   var select_to = $('select[name="to-currency"]')[0];
   // verschiedene Wege, auf Eigenschaften von Objekten zuzugreifen
   var input_from = document.exchange['from-value'];
   var input_to = document['exchange']['to-value'];

   // Event Handler

   $('input')
      .on('input', function(event) {
         var amount = event.target.value;
         var currency = (event.target === input_from ? select_from : select_to).value;

         updateInputFields(event.target);
         updateOverview(amount, currency);
      })
      .on('keydown', function(event) {
         // Zuordnung von Tasten zu Wertveränderung
         // 'hoch' und 'runter' verändern um 10, '+' und '-' um 100
         var mapping = {
            38: 10,
            40: -10,
            187: 100,
            189: -100
         };

         // Prüfe, ob es einen Wert für diese Taste gibt
         if (event.keyCode in mapping) {
            // verhindere, dass beispielsweise ein '+' eingefügt wird
            event.preventDefault();
            // Verrechne den aktuellen Wert mit der entsprechenden Veränderung und ersetze ihn
            // '+this.value' sichert, dass 'value' - sofern möglich - als Zahl behandelt wird
            this.value = +this.value + mapping[event.keyCode];
         }

         // 'input'-Event triggern, um dazugehöriges Verhalten auszulösen (Aktualisieren der Werte)
         $(this).trigger('input');
      });

   // Bei Wechseln der Währung, ändere die entsprechenden Beträge
   $('select').on('change', function(event) {
      updateInputFields(event.target === select_from ? input_to : input_from);
   });

   // Funktionen (als Ausdrücke, nicht Deklarationen)

   var initialize = function() {
      // hole gleich zu Beginn frische Daten vom Server und führe danach die folgende Funktion aus
      fetchData(function() {
         input_from.value = '100';
         updateInputFields(input_from);
         updateOverview(input_from.value, select_from.value);
      });

      updateSelections();

      // setze die Anfangs-Auswahl auf Euro zu US-Dollar
      select_from.querySelector('option[value="EUR"]').selected = true;
      select_to.querySelector('option[value="USD"]').selected = true;
   };

   var fetchData = function(callback) {
      $.ajax({
         url: api_url,
         dataType: 'jsonp',
         timeout: 3000
      })
         .success(function(data) {
            rates = data.rates;
            if (callback) callback();
         })
         .error(function() {
            $('.error-msg').fadeIn('slow');
         });
   };

   var updateInputFields = function(origin_input_element) {
      if (origin_input_element === input_from) {
         input_to.value = getChangedValue(origin_input_element.value, select_from.value, select_to.value);
      }
      else {
         input_from.value = getChangedValue(origin_input_element.value, select_to.value, select_from.value);
      }
   };

   // aktualisiere die Auswahllisten der Währungen
   var updateSelections = function() {
      // wir benutzen aus Performance-Gründen Document-Fragments, sodass final nur einmal auf den DOM zugegriffen werden muss
      var fragment = document.createDocumentFragment();
      var element;

      // Generiere für jede Währung eine entsprechende Option für die Drop-Downs
      $.each(currencies, function(index, value) {
         element = document.createElement('option');
         element.text = index + ' - ' + value;
         element.value = index;
         fragment.appendChild(element);
      });

      // klone die Liste und füge in beiden Select-Elementen jeweils eine ein
      select_from.appendChild(fragment.cloneNode(true));
      select_to.appendChild(fragment);
   };

   // aktualisieren die Wechselkurs-Übersicht
   var updateOverview = function(amount, currency) {
      var list = document.createElement('ul');

      var element;
      for (var i = 0; i < fav_currencies.length; i++) {
         element = document.createElement('li');
         element.textContent = fav_currencies[i] + ": " + getChangedValue(amount, currency, fav_currencies[i]);
         list.appendChild(element);
      }

      $(overview).empty().append(list);
   };

   // Berechne für eine Geldmenge einer Währung die entsprechende Geldmenge in einer Fremdwährung
   var getChangedValue = function(amount, from_currency, to_currency) {
      var value = amount / rates[from_currency] * rates[to_currency];
      return Math.round(value * 100) / 100;
   };

   // Initialisere den Ausgangszustand
   initialize();

});
