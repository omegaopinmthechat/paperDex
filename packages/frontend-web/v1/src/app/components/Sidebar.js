'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ALL_SERVICES, SERVICE_CATEGORIES } from './servicesData';
import { useTerminal } from './terminal/TerminalContext';

export default function Sidebar({ isOpen }) {
  const pathname = usePathname();
  const { setIsOpen: setTerminalOpen } = useTerminal();

  return (
    <aside
      aria-label="Site Navigation"
      style={{
        width: isOpen ? '220px' : '0px',
        minWidth: isOpen ? '220px' : '0px',
        flexShrink: 0,
        overflowX: 'hidden',
        overflowY: isOpen ? 'auto' : 'hidden',
        transition: 'width 0.22s cubic-bezier(0.16,1,0.3,1), min-width 0.22s cubic-bezier(0.16,1,0.3,1)',
        background: '#FFFFFF',
        borderRight: '1px solid rgba(15,15,15,0.08)',
        display: 'flex',
        flexDirection: 'column',
        /* sits in the row below the sticky navbar — not fixed/absolute */
        position: 'sticky',
        top: '54px',            /* matches navbar height */
        height: 'calc(100dvh - 54px)',
        alignSelf: 'flex-start',
      }}
    >
      {/* Inner wrapper — keeps content at fixed width so nothing wraps during animation */}
      <div style={{ width: '220px', display: 'flex', flexDirection: 'column', flex: 1 }}>

        {SERVICE_CATEGORIES.map((category) => {
          const items = ALL_SERVICES.filter((s) => s.category === category);
          return (
            <div key={category} style={{ paddingTop: '20px' }}>
              {/* Category label */}
              <div
                style={{
                  padding: '0 16px 6px',
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.10em',
                  textTransform: 'uppercase',
                  color: '#AAAAAA',
                  whiteSpace: 'nowrap',
                }}
              >
                {category}
              </div>

              {/* Divider */}
              <div style={{ height: '1px', background: 'rgba(15,15,15,0.06)', margin: '0 0 4px' }} />

              {/* Items */}
              {items.map((service) => {
                const Icon = service.icon;
                const isActive = !service.isAction && pathname === service.href;

                const commonStyle = {
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '8px 14px 8px 16px',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background 0.12s ease',
                  background: isActive ? 'rgba(15,15,15,0.04)' : 'transparent',
                  borderLeft: isActive
                    ? `3px solid ${service.accentColor}`
                    : '3px solid transparent',
                  width: '100%',
                  textAlign: 'left',
                  fontFamily: 'inherit',
                  border: 'none',
                  outline: 'none',
                };

                const content = (
                  <>
                    <div
                      style={{
                        marginTop: '2px',
                        color: isActive ? service.accentColor : '#888',
                        flexShrink: 0,
                        transition: 'color 0.12s ease',
                      }}
                    >
                      <Icon size={15} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: isActive ? 600 : 500,
                          color: isActive ? '#0F0F0F' : '#333',
                          whiteSpace: 'nowrap',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        {service.name}
                      </div>
                      <div
                        style={{
                          fontSize: '11px',
                          color: '#999',
                          marginTop: '1px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {service.shortDesc}
                      </div>
                    </div>
                  </>
                );

                if (service.isAction) {
                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => setTerminalOpen((p) => !p)}
                      style={commonStyle}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(15,15,15,0.04)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      {content}
                    </button>
                  );
                }

                return (
                  <Link
                    key={service.id}
                    href={service.href}
                    style={commonStyle}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.background = 'rgba(15,15,15,0.04)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.background = 'rgba(15,15,15,0.04)';
                      if (!isActive) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    {content}
                  </Link>
                );
              })}
            </div>
          );
        })}

        {/* Bottom spacer */}
        <div style={{ flex: 1 }} />
        <div
          style={{
            padding: '16px',
            borderTop: '1px solid rgba(15,15,15,0.06)',
            fontSize: '10px',
            color: '#CCC',
            whiteSpace: 'nowrap',
            letterSpacing: '0.04em',
          }}
        >
          PaperDEX v2.0
        </div>
      </div>
    </aside>
  );
}

