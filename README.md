# Web-сервис поиска нормативных документов

## 1. Общая информация
Сайт помогает найти нормативные документы (в частности, ГОСТы), используя текстовый и семантический поиск. Искать можно как по номеру, так и просто по интересующей области.

Также для любого из документов можно посмотреть топ 10 похожих на него, а сами документы можно сохранять в коллекции.

## 2. Архитектура системы
![image](https://github.com/user-attachments/assets/138f641a-8c8e-4dea-bdc9-fbfc0fc6a58e)

![image](https://github.com/user-attachments/assets/be6b846f-a029-4d6f-b2e0-de276deb7eb7)

## 3. Структура проекта:
```
semantic_search_website/
├── 📁 client/ # Клиентская часть (React.js)
│ ├── src/
│ │ │── http/ # Настройки axios для связи с бэкендом
│ │ │── routes/ # Общие настройки клиентской части
│ │ │── sections/ # Оформление страниц сайта (404, админская панель, сам поиск, личный кабинет, авторизация)
│ │ │── store/ # настройк mobx хранилища
│ │ └── subcomponents/ # Footer & header
│── 📁 research/ # Jupyter-ноутбуки с экспериментами
├── 📁 semantic_search/ # Контейнер с нейронкой (запускается с помощью Docker)
│ ├── app/
│ │ │── config.py/ # Конфиг запуска (пути к моделькам, порты, dev/production запуск)
│ │ │── exception_handler.py/ # Обработка исклюний для FastAPI
│ │ │── log.ini/ # Конфиг логов
│ │ │── main.py/ # Здесь вся логика по обработке запросов
│ │ │── schema.py/ # Схемы для запросов/ответов FastAPI
│ │ └── utils.py/ # Вспомогательные функции (токенизация, average_pool)
│ ├── models/ # Здесь живут модельки (в папках вида multilingual-e5-large) веса, .onnx и токенизатор
| └── Dockerfile/ # Dockerfile с nvidia:cuda & miniconda py39 & torch qdrant
├── 📁 server/ # Серверная часть
│ ├── controllers/ # Контроллеры (основная логика)
│ ├── middleware/ # Middleware для авторизации и проверки ролкй
│ ├── models/ # Модели данных в MongoDB
│ ├── routers/ # Роутеры (маршрутизация запросов к нужным методам контроллеров)
│ └── uploads/ # Папка для загруженных документов (pdf)
└── README.md # Вы здесь
```

Qdrant запускается просто отдельным контейнером, подключение к нему осуществляется из semantic_search/app/main.py.

## 4. Интерфейс
### 1. Сам поиск
![image](https://github.com/user-attachments/assets/065a047e-a052-4c07-9c80-f5a6dc6fe558)
### 2. Коллекции
![image](https://github.com/user-attachments/assets/b46c5ba1-0dc5-4dee-a831-19063b3effdd)
### 3. Админ-панель
![image](https://github.com/user-attachments/assets/749982ca-914f-48df-b671-7688754c8985)


