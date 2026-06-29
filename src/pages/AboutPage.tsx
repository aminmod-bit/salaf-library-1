import { BookOpen, CheckCircle, Globe2, HeartHandshake, ShieldCheck, Sparkles } from 'lucide-react';

const principles = [
  { icon: ShieldCheck, title: 'Надёжность', text: 'Материалы каталогизируются аккуратно: название, автор, категория, описание и PDF-ссылка.' },
  { icon: BookOpen, title: 'Удобное чтение', text: 'Книги доступны онлайн с сохранением прогресса, закладками, поиском и адаптацией под устройства.' },
  { icon: Globe2, title: 'Открытый доступ', text: 'Библиотека работает в браузере без установки приложения и доступна на телефонах, планшетах и компьютерах.' },
  { icon: Sparkles, title: 'Качество интерфейса', text: 'Единая дизайн-система: тёмно-зелёная атмосфера, матовое золото, спокойная типографика и быстрый доступ к знаниям.' },
];

export default function AboutPage() {
  return (
    <div className="fade-in" style={{ maxWidth: 1160, margin: '0 auto' }}>
      <section className="glass-card" style={{ padding: '34px', marginBottom: 24, background: 'linear-gradient(135deg, rgba(13,42,24,.96), rgba(7,19,11,.94))' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#d4af37', fontSize: 12, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 14 }}>
          <HeartHandshake size={16} /> О проекте
        </div>
        <h1 style={{ fontSize: 'clamp(30px, 5vw, 54px)', lineHeight: 1.05, fontWeight: 900, color: '#f0f4f1', marginBottom: 14 }}>
          Salaf Library — исламская цифровая библиотека для ежедневного чтения
        </h1>
        <p style={{ color: '#9db8a3', fontSize: 16, lineHeight: 1.8, maxWidth: 820 }}>
          Цель проекта — собрать полезные исламские книги, аудио, биографии и фаваиды в одном современном, аккуратном и удобном приложении. Библиотека создаётся как долгосрочный продукт: быстрый поиск, онлайн-чтение, закладки, прогресс и понятный каталог.
        </p>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 24 }}>
        {principles.map(({ icon: Icon, title, text }) => (
          <div key={title} className="glass-card" style={{ padding: 22 }}>
            <div style={{ width: 42, height: 42, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(212,175,55,.12)', color: '#d4af37', marginBottom: 14 }}>
              <Icon size={21} />
            </div>
            <h2 style={{ color: '#f0f4f1', fontWeight: 800, fontSize: 17, marginBottom: 8 }}>{title}</h2>
            <p style={{ color: '#9db8a3', fontSize: 14, lineHeight: 1.65 }}>{text}</p>
          </div>
        ))}
      </section>

      <section className="glass-card" style={{ padding: 26 }}>
        <h2 style={{ color: '#f0f4f1', fontWeight: 850, fontSize: 22, marginBottom: 14 }}>Принципы публикации</h2>
        <div style={{ display: 'grid', gap: 12 }}>
          {[
            'Материалы должны быть полезными, корректно подписанными и пригодными для чтения.',
            'Если пользователь видит ошибку в названии, авторе или файле — он должен иметь возможность сообщить об этом.',
            'Интерфейс не должен отвлекать от знания: чистый фон, понятные действия, спокойная визуальная система.',
            'Проект должен оставаться быстрым и масштабируемым даже при тысячах книг.'
          ].map(item => (
            <div key={item} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', color: '#9db8a3', lineHeight: 1.65 }}>
              <CheckCircle size={17} color="#22c55e" style={{ marginTop: 3, flexShrink: 0 }} />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
