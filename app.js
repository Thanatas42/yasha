// Массив шиномонтажей для демонстрации
const tireServices = [
  {
    id: 1,
    name: 'Шиномонтаж №1',
    address: 'Автовская ул., 35А',
    workingHours: '9:00 - 18:00',
    coords: [59.877353, 30.280951],
  },
  {
    id: 2,
    name: 'Шиномонтаж №2',
    address: 'Московский проспект, 154',
    workingHours: '10:00 - 20:00',
    coords: [59.882415, 30.321069],
  }, {
    id: 2,
    name: 'Шиномонтаж №2',
    address: 'Московский проспект, 154',
    workingHours: '10:00 - 20:00',
    coords: [59.882415, 30.321069],
  }, {
    id: 2,
    name: 'Шиномонтаж №2',
    address: 'Московский проспект, 154',
    workingHours: '10:00 - 20:00',
    coords: [59.882415, 30.321069],
  }, {
    id: 2,
    name: 'Шиномонтаж №2',
    address: 'Московский проспект, 154',
    workingHours: '10:00 - 20:00',
    coords: [59.882415, 30.321069],
  }, {
    id: 2,
    name: 'Шиномонтаж №2',
    address: 'Московский проспект, 154',
    workingHours: '10:00 - 20:00',
    coords: [59.882415, 30.321069],
  }, {
    id: 2,
    name: 'Шиномонтаж №2',
    address: 'Московский проспект, 154',
    workingHours: '10:00 - 20:00',
    coords: [59.882415, 30.321069],
  }, {
    id: 2,
    name: 'Шиномонтаж №2',
    address: 'Московский проспект, 154',
    workingHours: '10:00 - 20:00',
    coords: [59.882415, 30.321069],
  }, {
    id: 2,
    name: 'Шиномонтаж №2',
    address: 'Московский проспект, 154',
    workingHours: '10:00 - 20:00',
    coords: [59.882415, 30.321069],
  }, {
    id: 2,
    name: 'Шиномонтаж №2',
    address: 'Московский проспект, 154',
    workingHours: '10:00 - 20:00',
    coords: [59.882415, 30.321069],
  }, {
    id: 2,
    name: 'Шиномонтаж №2',
    address: 'Московский проспект, 154',
    workingHours: '10:00 - 20:00',
    coords: [59.882415, 30.321069],
  },
];

// Инициализация карты и добавление меток
ymaps.ready(init);

function init() {
  const map = new ymaps.Map("map", {
    center: [59.943988, 30.306329],
    zoom: 10,
  });

  const showToggle = document.getElementById("show-toggle");

  showToggle.onclick = function () {
    const elements = showToggle.getElementsByClassName("service__show-line");
    for (let i = 0; i < elements.length; i++) {
      const currentTransform = elements[i].style.transform;

      if (i === 0) {
        if (currentTransform === 'rotate(-0.25turn)') {
          elements[i].style.transform = '';
        } else {
          elements[i].style.transform = 'rotate(-0.25turn)';
        }
      } else {
        if (currentTransform === 'rotate(0.5turn)') {
          elements[i].style.transform = '';
        } else {
          elements[i].style.transform = 'rotate(0.5turn)';
        }
      }
    }

    showToggle.classList.toggle("service__show-toggle_theme_service_open");
    document.getElementById("service-list").classList.toggle("service__list_theme_open");
  };

  tireServices.forEach(service => {
    const placemark = new ymaps.Placemark(service.coords, {
      balloonContent: `<strong>${service.name}</strong><br>${service.address}<br>${service.workingHours}<br><button onclick="selectService(${service.id})">Выбрать</button>`,
    });
    map.geoObjects.add(placemark);
  });

  // Отобразить список шиномонтажей
  const serviceList = document.getElementById('service-list');
  tireServices.forEach(service => {
    const listItem = document.createElement('li');
    listItem.classList.add('service-item');
    listItem.innerHTML = `<strong>${service.name}</strong><br>${service.address}<br>${service.workingHours}<br><button onclick="selectService(${service.id})">Выбрать</button>`;
    serviceList.appendChild(listItem);
  });
}

// Выбор шиномонтажа
function selectService(id) {
  const selectedService = tireServices.find(service => service.id === id);

  document.getElementById('service-address').textContent = selectedService.address;
  document.getElementById('service-hours').textContent = selectedService.workingHours;
  document.getElementById('selected-service').style.display = 'block';

  // Обработчик для отправки заявки
  document.getElementById('submit-request').onclick = function () {
    sendRequest(selectedService);
  };
}

// Функция отправки заявки
function sendRequest(service) {
  // Имитируем отправку данных на сервер
  const requestData = {
    orderId: '12345',  // Для демо
    tireServiceId: service.id,
  };

  console.log('Отправка заявки:', requestData);

  // Здесь можно использовать AJAX или fetch для реальной отправки данных
  alert(`Заявка на шиномонтаж "${service.name}" отправлена!`);
}
