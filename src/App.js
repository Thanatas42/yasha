import React, { useState, useEffect, useRef } from 'react';
import { YMaps, Map, Placemark, SearchControl, TrafficControl, Clusterer } from '@pbe/react-yandex-maps';

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
  }
};

function App() {
  const [placemarks, setPlacemarks] = useState([]);
  const [activePlacemark, setActivePlacemark] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [popupData, setPopupData] = useState({ name: '', shedule: '', address: '' });
  const [visiblePlacemarks, setVisiblePlacemarks] = useState([]);
  const [selectShin, setSelectShin] = useState({});
  const [status, setStatus] = useState(false);

  const mapRef = useRef(null);
  const placemarkRefs = useRef({});

  const name = 'Дудин Дмитрий Сергеевич';
  const phone = '89634665120';

  useEffect(() => {
    const fetchPlacemarks = async () => {
      try {
        const data = await getPlacemarks();
        setPlacemarks(data.sort((a, b) => a.name.localeCompare(b.name)));
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

  function handleSubmit() {
    setStatus(true);
    createReq(selectShin).finally(() => {
      setStatus(false);
    });
  }

  function handleSelect(e) {
    e.preventDefault();

    const body = {
      id: 1, ...popupData, request: { desc: '4 шины Pirelli 245/45/18 зима шипы' }
    };

    setSelectShin(body);

    handleCloseButton();
  }

  function handleReset() {
    setSelectShin({});
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

  function handleCloseButton() {
    setIsOpen(false);
    setPopupData({ name: '', shedule: '', address: '' });
  }

  const handleBoundsChange = (e, map) => {
    const bounds = map.getBounds();

    const visible = placemarks.filter(({ coords }) => {
      const [lat, lon] = coords.split(',').map(Number);
      return (
        lat >= bounds[0][0] && lat <= bounds[1][0] &&
        lon >= bounds[0][1] && lon <= bounds[1][1]
      );
    });

    setVisiblePlacemarks(visible);
  };

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
            onBoundsChange={(e) => handleBoundsChange(e, e.get('target'))}
          >
            <SearchControl options={{
              float: 'left'
            }} />
            <TrafficControl options={{
              float: 'right'
            }} />
            <Clusterer options={{
              preset: 'islands#invertedVioletClusterIcons',
              groupByCoordinates: false
            }}>
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
            </Clusterer>
          </Map>
        </YMaps>
        <button className='service__show-toggle' onClick={showPanel}>
        </button>
        <ul className='service__list' id='service-list'>
          {visiblePlacemarks.map((item, index) => {
            return <li className='service-item' key={index} onClick={() => handleItemClick(item)}>
              <h4>{item.name}</h4>
              <p>{item.address}</p>
              <p>{item.schedule}</p>
            </li>
          })}
        </ul>

        <div className='select' style={{ 'display': selectShin.name ? 'block' : 'none' }}>
          <div>
            <h5>Выбранный шиномонтаж:</h5>
            <p>{selectShin.name ? `«${selectShin.name}»` : ''}</p>
            <p>{selectShin.address ? selectShin.address : ''}</p>
            <p>{selectShin.schedule ? selectShin.schedule : ''}</p>
          </div>
          <fieldset className='select__actions'>
            <button onClick={handleSubmit}>{status ? <span className='select__loader'></span> : 'Оформить'}</button>
            <button onClick={handleReset}>Сбросить</button>
          </fieldset>
        </div>

        <div className={`popup ${isOpen ? 'popup_them_open' : ''}`}>
          <div className='popup__container'>
            <div className='popup__tittle_wrap'>
              <h4 className='popup__tittle'>Выбрать шиномонтаж</h4>
              <button className='popup__close_button' onClick={handleCloseButton}></button>
            </div>
            <form id='form' className='popup__form' onSubmit={handleSelect} noValidate>
              <div className='popup__detail'>
                <h5>{popupData.name}</h5>
                <p>{popupData.address}</p>
                <p>{popupData.schedule}</p>
              </div>
              <p>ФИО: {name}</p>
              <p>Контакт: {phone}</p>
              <div className='popup__submit-wrapp'>
                <button type='submit'>Выбрать</button>
              </div>
            </form>
          </div>
        </div>


      </div>
    </div >
  );
}

export default App;
