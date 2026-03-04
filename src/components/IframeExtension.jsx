import React, { useState, useEffect, useRef } from 'react';
import {
  SectionTitle,
  Table,
  Button,
} from 'akeneo-design-system';

const decodeJwt = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
};

const JsonBlock = ({ data }) => (
  <pre style={{
    background: '#f8f6fb',
    border: '1px solid #d8c8e8',
    borderRadius: '4px',
    padding: '12px',
    fontSize: '12px',
    fontFamily: 'monospace',
    overflow: 'auto',
    maxHeight: '220px',
    margin: '8px 0 0',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  }}>
    {JSON.stringify(data, null, 2)}
  </pre>
);

const StatusPill = ({ ok, label }) => (
  <span style={{
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 600,
    background: ok ? '#e6f4ea' : '#fef3c7',
    color: ok ? '#2d7d46' : '#92400e',
    border: `1px solid ${ok ? '#a8d5b5' : '#fcd34d'}`,
  }}>
    {label}
  </span>
);

const EventCard = ({ index, total, event, firstLabel }) => (
  <div style={{
    border: '1px solid #d8c8e8',
    borderRadius: '6px',
    padding: '12px',
    background: '#fff',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
      <strong style={{ fontSize: '13px' }}>
        {index === 0 ? firstLabel : `Event #${index + 1}`}
      </strong>
      {index === 0 && total > 1 && <StatusPill ok={false} label="then changes detected" />}
      <span style={{ fontSize: '11px', color: '#888', marginLeft: 'auto' }}>{event.timestamp}</span>
    </div>
    <JsonBlock data={event.data} />
  </div>
);

const IframeExtension = () => {
  const [urlParams, setUrlParams] = useState([]);
  const [autoContextEvents, setAutoContextEvents] = useState([]);
  const [requestedContext, setRequestedContext] = useState(null);
  const [jwtData, setJwtData] = useState(null);
  const [reloadSent, setReloadSent] = useState(false);
  const [eventLog, setEventLog] = useState([]);

  const pendingContextRequest = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const parsed = [];
    for (const [key, value] of params.entries()) {
      parsed.push({ key, value });
    }
    setUrlParams(parsed);

    const handleMessage = (event) => {
      const timestamp = new Date().toISOString();
      const data = event.data;

      if (!data || typeof data !== 'object') return;

      // Build event log entry
      let type = 'unknown';
      if (data.type === 'JWT_TOKEN') {
        type = 'jwt_response';
      } else if (data.context !== undefined) {
        type = pendingContextRequest.current ? 'requested_context' : 'auto_context';
      }

      setEventLog((prev) => [...prev, { timestamp, origin: event.origin, type, data }]);

      if (data.type === 'JWT_TOKEN') {
        const decoded = decodeJwt(data.token);
        setJwtData({ timestamp, raw: data.token, decoded });
      } else if (data.context !== undefined) {
        if (pendingContextRequest.current) {
          pendingContextRequest.current = false;
          setRequestedContext({ timestamp, data });
        } else {
          setAutoContextEvents((prev) => [...prev, { timestamp, data }]);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const requestContext = () => {
    pendingContextRequest.current = true;
    window.parent.postMessage({ type: 'request_context' }, '*');
  };

  const requestJwt = () => {
    window.parent.postMessage({ type: 'request_jwt' }, '*');
  };

  const reloadParent = () => {
    window.parent.postMessage({ type: 'reload_parent' }, '*');
    setReloadSent(true);
  };

  const eventTypeLabel = {
    auto_context: 'auto context',
    requested_context: 'requested context',
    jwt_response: 'JWT response',
    unknown: 'unknown',
  };

  const eventTypeColor = {
    auto_context: '#7c3aed',
    requested_context: '#1d4ed8',
    jwt_response: '#065f46',
    unknown: '#6b7280',
  };

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* ── URL Parameters ── */}
      <div>
        <SectionTitle>
          <SectionTitle.Title>URL Parameters</SectionTitle.Title>
        </SectionTitle>
        {urlParams.length === 0 ? (
          <p style={{ fontStyle: 'italic', color: '#888', margin: '8px 0' }}>No URL parameters found</p>
        ) : (
          <Table>
            <Table.Header>
              <Table.HeaderCell>Parameter</Table.HeaderCell>
              <Table.HeaderCell>Value</Table.HeaderCell>
            </Table.Header>
            <Table.Body>
              {urlParams.map(({ key, value }) => (
                <Table.Row key={key}>
                  <Table.Cell>
                    <span style={{ fontFamily: 'monospace', fontSize: '13px' }}>{key}</span>
                  </Table.Cell>
                  <Table.Cell>
                    <span style={{ fontFamily: 'monospace', fontSize: '13px', color: '#58316f' }}>{value}</span>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </div>

      {/* ── Auto Context Events ── */}
      <div>
        <SectionTitle>
          <SectionTitle.Title>Auto Context Events</SectionTitle.Title>
          {autoContextEvents.length > 0 && (
            <SectionTitle.Information>
              {autoContextEvents.length} event{autoContextEvents.length !== 1 ? 's' : ''} received
            </SectionTitle.Information>
          )}
        </SectionTitle>
        <p style={{ fontSize: '13px', color: '#666', margin: '4px 0 12px' }}>
          The PIM automatically sends a context event when the iframe loads, and again whenever the user changes the locale or scope.
        </p>
        {autoContextEvents.length === 0 ? (
          <StatusPill ok={false} label="No auto context event received yet" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {autoContextEvents.map((event, index) => (
              <EventCard
                key={index}
                index={index}
                total={autoContextEvents.length}
                event={event}
                firstLabel="Initial load event"
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Request Context ── */}
      <div>
        <SectionTitle>
          <SectionTitle.Title>Request Context via PostMessage</SectionTitle.Title>
        </SectionTitle>
        <p style={{ fontSize: '13px', color: '#666', margin: '4px 0 12px' }}>
          Send <span style={{ fontFamily: 'monospace', background: '#f0ebf7', padding: '1px 5px', borderRadius: '3px' }}>{'{ type: "request_context" }'}</span> to the parent window and wait for the response.
        </p>
        <Button onClick={requestContext}>Request Context</Button>
        {requestedContext ? (
          <div style={{ marginTop: '12px' }}>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>
              Response received at {requestedContext.timestamp}
            </div>
            <JsonBlock data={requestedContext.data} />
          </div>
        ) : (
          <p style={{ fontStyle: 'italic', color: '#888', marginTop: '10px' }}>No response yet — click the button above</p>
        )}
      </div>

      {/* ── Request JWT ── */}
      <div>
        <SectionTitle>
          <SectionTitle.Title>Request JWT via PostMessage</SectionTitle.Title>
        </SectionTitle>
        <p style={{ fontSize: '13px', color: '#666', margin: '4px 0 12px' }}>
          Send <span style={{ fontFamily: 'monospace', background: '#f0ebf7', padding: '1px 5px', borderRadius: '3px' }}>{'{ type: "request_jwt" }'}</span> — response is <span style={{ fontFamily: 'monospace', background: '#f0ebf7', padding: '1px 5px', borderRadius: '3px' }}>{'{ type: "JWT_TOKEN", token: "..." }'}</span>.
        </p>
        <Button onClick={requestJwt} level="secondary">Request JWT</Button>
        {jwtData ? (
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '12px', color: '#888' }}>Response received at {jwtData.timestamp}</div>
            <div>
              <strong style={{ fontSize: '13px' }}>Raw token</strong>
              <div style={{
                background: '#f8f6fb',
                border: '1px solid #d8c8e8',
                borderRadius: '4px',
                padding: '10px',
                fontSize: '11px',
                fontFamily: 'monospace',
                wordBreak: 'break-all',
                marginTop: '6px',
              }}>
                {jwtData.raw}
              </div>
            </div>
            {jwtData.decoded && (
              <div>
                <strong style={{ fontSize: '13px' }}>Decoded payload</strong>
                <JsonBlock data={jwtData.decoded} />
              </div>
            )}
          </div>
        ) : (
          <p style={{ fontStyle: 'italic', color: '#888', marginTop: '10px' }}>No JWT received yet — click the button above</p>
        )}
      </div>

      {/* ── Reload Parent ── */}
      <div>
        <SectionTitle>
          <SectionTitle.Title>Reload Parent Page via PostMessage</SectionTitle.Title>
        </SectionTitle>
        <p style={{ fontSize: '13px', color: '#666', margin: '4px 0 12px' }}>
          Send <span style={{ fontFamily: 'monospace', background: '#f0ebf7', padding: '1px 5px', borderRadius: '3px' }}>{'{ type: "reload_parent" }'}</span> to trigger a full reload of the parent PIM page.
        </p>
        <Button onClick={reloadParent} level="tertiary">Reload Parent Page</Button>
        {reloadSent && (
          <p style={{ color: '#2d7d46', marginTop: '8px', fontSize: '13px' }}>
            ✓ <code>reload_parent</code> message sent — the parent page should reload
          </p>
        )}
      </div>

      {/* ── Raw Event Log ── */}
      <div>
        <SectionTitle>
          <SectionTitle.Title>Raw Event Log</SectionTitle.Title>
          {eventLog.length > 0 && (
            <SectionTitle.Information>{eventLog.length} event{eventLog.length !== 1 ? 's' : ''}</SectionTitle.Information>
          )}
        </SectionTitle>
        <p style={{ fontSize: '13px', color: '#666', margin: '4px 0 12px' }}>
          All postMessage events received from the parent window, in order.
        </p>
        {eventLog.length === 0 ? (
          <p style={{ fontStyle: 'italic', color: '#888' }}>No events received yet</p>
        ) : (
          <div style={{
            border: '1px solid #d8c8e8',
            borderRadius: '6px',
            maxHeight: '320px',
            overflow: 'auto',
            fontSize: '12px',
            fontFamily: 'monospace',
          }}>
            {eventLog.map((entry, index) => (
              <div key={index} style={{
                padding: '8px 12px',
                borderBottom: index < eventLog.length - 1 ? '1px solid #ece6f4' : 'none',
                background: index % 2 === 0 ? '#fff' : '#faf8fd',
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start',
              }}>
                <span style={{ color: '#aaa', flexShrink: 0 }}>{entry.timestamp}</span>
                <span style={{
                  flexShrink: 0,
                  padding: '1px 7px',
                  borderRadius: '10px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#fff',
                  background: eventTypeColor[entry.type] || '#6b7280',
                }}>
                  {eventTypeLabel[entry.type] || entry.type}
                </span>
                <span style={{ color: '#555', wordBreak: 'break-all' }}>{JSON.stringify(entry.data)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default IframeExtension;
