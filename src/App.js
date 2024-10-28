import React, { useState, useEffect, useRef } from 'react';
import { YMaps, Map, Placemark, SearchControl, TrafficControl } from '@pbe/react-yandex-maps';

const getPlacemarks = async () => {
  const url = `http://localhost:3001/placemarks`;

  try {
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw { status: res.status, message: errorData.message };
    }

    return await res.json();
  } catch (error) {
    console.error("Ошибка при получении данных:", error);
    throw error;
  }
};

const createReq = async (body) => {
  const url = `http://localhost:3001/form-request`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw { status: res.status, message: errorData.message };
    }

    return await res.json();
  } catch (error) {
    console.error("Ошибка при создании запроса:", error);
    throw error;
  }
};


function App() {
  const [placemarks, setPlacemarks] = useState([]);
  const [activePlacemark, setActivePlacemark] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [popupData, setPopupData] = useState({ name: '', shedule: '', address: '' });
  const [requestData, setRequestData] = useState({});
  const mapRef = useRef(null);
  const placemarkRefs = useRef({});

  useEffect(() => {
    const fetchPlacemarks = async () => {
      try {
        const data = await getPlacemarks();
        setPlacemarks(data);
      } catch (error) {
        console.error("Ошибка при установке данных:", error);
      }
    };

    fetchPlacemarks();
  }, []);

  useEffect(() => {
    if (placemarks.length !== 0) {
      window.selectService = (id) => {

        setPopupData(placemarks.find(x => x.id === id));
        setIsOpen(true);
      }
    }

  }, [placemarks]);

  function handleSubmit(e) {
    e.preventDefault();

    const body = { id: popupData.id, client: requestData, request: { desc: '4 шины Pirelli 245/45/18 зима шипы' } };

    createReq(body);

    handleCloseButton();
  }

  const showPanel = (event) => {
    event.target.classList.toggle('service__show-toggle_theme_service_open');
    document.getElementById('service-list').classList.toggle('service__list_theme_open');
  };

  const handleItemClick = (place) => {

    setActivePlacemark(place.id);
    if (mapRef.current) {
      const [lat, lon] = place.coords.split(',').map(Number);

      mapRef.current.panTo([lat, lon], { duration: 500 });
    }

    if (placemarkRefs.current[place.id]) {
      placemarkRefs.current[place.id].balloon.open();
    }
  };

  const handleChange = (event) => {
    const target = event.target;
    setRequestData({ ...requestData, [target.name]: target.value });
  };

  function handleCloseButton() {
    setIsOpen(false);
    setPopupData({ name: '', shedule: '', address: '' });
    setRequestData({});
  }

  return (
    <div className='body'>
      <div className='service__wrapp'>
        <YMaps>
          <Map
            instanceRef={mapRef}
            defaultState={{
              center: [59.943988, 30.306329],
              zoom: 10,
              controls: ['zoomControl', 'fullscreenControl']
            }}
            modules={['control.ZoomControl', 'control.FullscreenControl']}
            width='100%'
            height='100%'
          >
            <SearchControl options={{
              float: 'left'
            }} />
            <TrafficControl options={{
              float: 'right'
            }} />
            {placemarks.map((place) => {
              const [lat, lon] = place.coords.split(',').map(Number);
              return (
                <Placemark
                  key={place.id}
                  geometry={[lat, lon]}
                  instanceRef={(ref) => {
                    if (ref) {
                      placemarkRefs.current[place.id] = ref;
                    }
                  }}
                  properties={{
                    balloonContentHeader: `<strong>${place.name}</strong>`,
                    balloonContentBody: `
                      <div>
                        <p>${place.address}</p>
                        <p>${place.schedule}</p>
                        <button onclick="window.selectService(${place.id})">Выбрать</button>
                      </div>
                    `,
                  }}
                  options={{
                    preset: 'islands#icon',
                    iconColor: activePlacemark === place.id ? '#FF0000' : '#525e75',
                  }}
                />
              );
            })}
          </Map>
        </YMaps>
        <button className='service__show-toggle' onClick={showPanel}>
        </button>
        <ul className='service__list' id='service-list'>
          {placemarks.map((item, index) => {
            return <li className='service-item' key={index} onClick={() => handleItemClick(item)}>
              <h4>{item.name}</h4>
              <p>{item.address}</p>
              <p>{item.schedule}</p>
            </li>
          })}
        </ul>

        <div className={`popup ${isOpen ? 'popup_them_open' : ''}`}>
          <div className='popup__container'>
            <div className='popup__tittle_wrap'>
              <h5 className='popup__tittle'>Оформить заявку</h5>
              <button className='popup__close_button' onClick={handleCloseButton}></button>
            </div>
            <form id='form' className='popup__form' onSubmit={handleSubmit} noValidate>
              <div>
                <h5>{popupData.name}</h5>
                <p>{popupData.address}</p>
                <p>{popupData.schedule}</p>
                <p>4 шины Pirelli 245/45/18 зима шипы</p>
              </div>
              <fieldset>
                <label>ФИО</label>
                <input type='text' name='name' required={true} onChange={handleChange} value={requestData.name || ''}></input>
                <label>Телефон</label>
                <input type='phone' name='phone' required={true} onChange={handleChange} value={requestData.phone || ''}></input>
              </fieldset>
              <div className='popup__submit-wrapp'>
                <button type='submit'>Отправить</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div >
  );
}

export default App;
