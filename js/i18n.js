// Dil desteği: TR · EN · RU
// HTML'de sabit metin: data-i18n="anahtar" (içerik), data-i18n-aria="anahtar" (aria-label).
// Kod içinde dinamik metin: t("anahtar"), tz(bölge), tName(dövme), tStyle(stil); dil değişince onLang(cb) çağrılır.
export const LANGS = ["tr", "en", "ru"];
const IDX = { tr: 0, en: 1, ru: 2 };

// anahtar: [TR, EN, RU]
const D = {
  "meta.title": ["Yaga Tattoo", "Yaga Tattoo", "Yaga Tattoo"],
  "meta.desc": ["Yaga Tattoo — Natalya Andiç dövme stüdyosu.", "Yaga Tattoo — Natalya Andiç's tattoo studio.", "Yaga Tattoo — тату-студия Натальи Андич."],
  "nav.works": ["ESERLER", "WORKS", "РАБОТЫ"],
  "nav.design": ["TASARIM", "DESIGN", "ДИЗАЙН"],
  "nav.book": ["RANDEVU", "BOOKING", "ЗАПИСЬ"],
  "nav.lang": ["Dil", "Language", "Язык"],

  "hero.artist": ["NATALYA ANDİÇ", "NATALYA ANDİÇ", "НАТАЛЬЯ АНДИЧ"],
  "hero.b1.h": ["Bulutların üstünde, gece yarısı.", "Above the clouds, at midnight.", "Над облаками, в полночь."],
  "hero.b1.p": ["Her dövme bir yolculukla başlar.", "Every tattoo begins with a journey.", "Каждая татуировка начинается с путешествия."],
  "hero.b2.h": ["Kapı yalnızca cesur olanlara açılır.", "The door opens only to the brave.", "Дверь открывается только смелым."],
  "hero.b3.h": ["Karga yolu gösterir.", "The crow shows the way.", "Ворона указывает путь."],
  "hero.b4.h": ["Her duvarda bir hikâye.", "A story on every wall.", "На каждой стене — история."],
  "hero.b4.p": ["Her çizgide bir iz.", "A mark in every line.", "След в каждой линии."],
  "hero.final": ["Mürekkep. Deri. Sabır.", "Ink. Skin. Patience.", "Чернила. Кожа. Терпение."],
  "hero.cta": ["RANDEVU AL", "BOOK NOW", "ЗАПИСАТЬСЯ"],
  "hero.hint": ["KAYDIR VE İÇERİ GİR", "SCROLL AND STEP INSIDE", "ЛИСТАЙ И ВОЙДИ"],

  "works.kicker": ["KARANLIKTAN DOĞANLAR", "BORN FROM THE DARK", "РОЖДЁННЫЕ ТЬМОЙ"],
  "works.title": ["Eserler", "Works", "Работы"],
  "works.sub": ["Blackwork, fine line ve geleneksel çizgiler.", "Blackwork, fine line and traditional lines.", "Блэкворк, файн-лайн и традиционные линии."],
  "works.note": ["Örnek çizimler yer tutucudur — stüdyonun gerçek çalışmalarıyla değiştirilecek.", "Sample drawings are placeholders — they will be replaced with the studio's real work.", "Рисунки-образцы — временные; их заменят настоящими работами студии."],
  "works.label": ["Yaga Tattoo", "Yaga Tattoo", "Yaga Tattoo"],
  "works.drag": ["Sürükle", "Drag", "Тяни"],
  "works.aria": ["Eserler", "Works", "Работы"],
  "works.prev": ["Önceki", "Previous", "Назад"],
  "works.next": ["Sonraki", "Next", "Вперёд"],

  "contact.h": ["Hikâyeni birlikte çizelim.", "Let's draw your story together.", "Нарисуем твою историю вместе."],
  "contact.p": ["Natalya Andiç ile randevu ve fiyat bilgisi için yaz.", "Write to Natalya Andiç for appointments and pricing.", "Напиши Наталье Андич по поводу записи и цен."],
  "contact.btn": ["INSTAGRAM'DAN YAZ", "MESSAGE ON INSTAGRAM", "НАПИСАТЬ В INSTAGRAM"],

  "d.kicker": ["DENE · YERLEŞTİR · KARAR VER", "TRY · PLACE · DECIDE", "ПРИМЕРЬ · РАЗМЕСТИ · РЕШИ"],
  "d.title": ["Tattoo Tasarım", "Tattoo Design", "Дизайн татуировки"],
  "d.sub": ["Bir dövme seç, vücuda sürükle; köşelerden büyüt, üstteki tutamaçla döndür.", "Pick a tattoo and drag it onto the body; resize from the corners, rotate with the top handle.", "Выбери татуировку и перетащи на тело; меняй размер за углы, вращай верхней ручкой."],
  "d.model": ["Model", "Model", "Модель"],
  "d.view": ["Yön", "View", "Ракурс"],
  "d.f": ["KADIN", "FEMALE", "ЖЕНЩИНА"],
  "d.m": ["ERKEK", "MALE", "МУЖЧИНА"],
  "d.front": ["ÖNDEN", "FRONT", "СПЕРЕДИ"],
  "d.back": ["ARKADAN", "BACK", "СЗАДИ"],
  "d.right": ["SAĞDAN", "RIGHT", "СПРАВА"],
  "d.left": ["SOLDAN", "LEFT", "СЛЕВА"],
  "d.canvas": ["Dövme deneme modeli", "Tattoo try-on model", "Модель для примерки татуировки"],
  "d.zoomout": ["Uzaklaştır", "Zoom out", "Уменьшить"],
  "d.zoomin": ["Yakınlaştır", "Zoom in", "Увеличить"],
  "d.fit": ["SIĞDIR", "FIT", "ВПИСАТЬ"],
  "d.pick": ["Dövme seç", "Choose a tattoo", "Выбери татуировку"],
  "d.size": ["Boyut", "Size", "Размер"],
  "d.rot": ["Döndür", "Rotate", "Поворот"],
  "d.del": ["SEÇİLİ DÖVMEYİ SİL", "DELETE SELECTED", "УДАЛИТЬ ВЫБРАННУЮ"],
  "d.clear": ["TÜMÜNÜ TEMİZLE", "CLEAR ALL", "ОЧИСТИТЬ ВСЁ"],
  "d.save": ["PNG İNDİR", "DOWNLOAD PNG", "СКАЧАТЬ PNG"],
  "d.note": ["Dövme seçtiğin bölgenin açısına ve kıvrımına göre otomatik oturur. Görseller örnektir; Natalya Andiç tasarımı sana özel çizer.", "The tattoo automatically fits the angle and curve of the area you choose. Images are samples; Natalya Andiç draws your design just for you.", "Татуировка автоматически подстраивается под угол и изгиб выбранной зоны. Изображения — образцы; Наталья Андич нарисует эскиз лично для тебя."],
  "d.empty": ["Bir dövme seç ve vücuda yerleştir", "Pick a tattoo and place it on the body", "Выбери татуировку и размести на теле"],
  "d.fitted": ["vücuda uyarlandı", "fitted to the body", "адаптировано к телу"],
  "d.free": ["Serbest yerleşim", "Free placement", "Свободное размещение"],
  "d.freeShort": ["Serbest", "Free", "Свободно"],
  "d.errImg": ["Görsel oluşturulamadı.", "Could not create the image.", "Не удалось создать изображение."],
  "d.errDl": ["Bu tarayıcı görseli indirmeye izin vermedi. Chrome ile deneyebilirsin.", "This browser did not allow the image download. Try Chrome.", "Этот браузер не разрешил скачать изображение. Попробуй Chrome."],

  "footer": ["YAGA TATTOO · NATALYA ANDİÇ · ADRES · TELEFON", "YAGA TATTOO · NATALYA ANDİÇ · ADDRESS · PHONE", "YAGA TATTOO · НАТАЛЬЯ АНДИЧ · АДРЕС · ТЕЛЕФОН"],
};

// Dövme adları (TATTOOS sırasıyla) ve stiller
const TATTOO_NAMES = {
  "Karga": ["Karga", "Crow", "Ворона"], "Hilal": ["Hilal", "Crescent", "Полумесяц"], "Hançer": ["Hançer", "Dagger", "Кинжал"],
  "Kafatası": ["Kafatası", "Skull", "Череп"], "Yılan": ["Yılan", "Snake", "Змея"], "Göz": ["Göz", "Eye", "Глаз"],
  "Güve": ["Güve", "Moth", "Мотылёк"], "Gül": ["Gül", "Rose", "Роза"],
};
const STYLES = {
  "Blackwork": ["Blackwork", "Blackwork", "Блэкворк"], "Fine line": ["Fine line", "Fine line", "Файн-лайн"],
  "Traditional": ["Traditional", "Traditional", "Традиционный"], "Neo-traditional": ["Neo-traditional", "Neo-traditional", "Неотрадиционный"],
  "Dotwork": ["Dotwork", "Dotwork", "Дотворк"],
};
// Vücut bölgeleri (anahtar = Türkçe ad)
const ZONES = {
  "Arka kol": ["Arka kol", "Back of arm", "Задняя часть руки"], "Baldır": ["Baldır", "Calf", "Икра"], "Bel": ["Bel", "Lower back", "Поясница"],
  "Ense": ["Ense", "Nape", "Затылок"], "Göğüs üstü": ["Göğüs üstü", "Upper chest", "Верх груди"], "Göğüs": ["Göğüs", "Chest", "Грудь"],
  "Kaburga": ["Kaburga", "Ribs", "Рёбра"], "Karın": ["Karın", "Abdomen", "Живот"], "Kaval": ["Kaval", "Shin", "Голень"],
  "Kürek": ["Kürek", "Shoulder blade", "Лопатка"], "Omuz": ["Omuz", "Shoulder", "Надплечье"], "Sırt yanı": ["Sırt yanı", "Side of back", "Бок спины"],
  "Sırt": ["Sırt", "Back", "Спина"], "Uyluk arkası": ["Uyluk arkası", "Back of thigh", "Задняя часть бедра"], "Uyluk": ["Uyluk", "Thigh", "Бедро"],
  "Ön kol": ["Ön kol", "Forearm", "Предплечье"], "Üst kol": ["Üst kol", "Upper arm", "Плечо"],
};

// ---------- durum ----------
function stored() { try { return localStorage.getItem("yaga-lang"); } catch { return null; } }
function detect() {
  const q = new URLSearchParams(location.search).get("lang");
  if (LANGS.includes(q)) return q;
  const s = stored();
  if (LANGS.includes(s)) return s;
  const n = (navigator.language || "tr").slice(0, 2).toLowerCase();
  return LANGS.includes(n) ? n : "en";
}
export let lang = detect();
const listeners = [];
export const onLang = (cb) => { listeners.push(cb); };

export const t = (key) => (D[key] ? D[key][IDX[lang]] : key);
const pick = (map, k) => (map[k] ? map[k][IDX[lang]] : k);
export const tz = (zone) => (zone ? pick(ZONES, zone) : t("d.freeShort"));
export const tName = (tattoo) => pick(TATTOO_NAMES, tattoo.name);
export const tStyle = (tattoo) => pick(STYLES, tattoo.style);

export function apply() {
  document.documentElement.lang = lang;
  document.title = t("meta.title");
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute("content", t("meta.desc"));
  document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll("[data-i18n-aria]").forEach((el) => { el.setAttribute("aria-label", t(el.dataset.i18nAria)); });
  document.querySelectorAll("[data-lang]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
}

export function setLang(l) {
  if (!LANGS.includes(l) || l === lang) return;
  lang = l;
  try { localStorage.setItem("yaga-lang", l); } catch { /* özel pencere vb. */ }
  apply();
  listeners.forEach((cb) => cb(l));
}

document.querySelectorAll("[data-lang]").forEach((b) => b.addEventListener("click", () => setLang(b.dataset.lang)));
apply();
