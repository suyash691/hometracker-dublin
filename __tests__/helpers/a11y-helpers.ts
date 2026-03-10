// Common fetch mock for accessibility tests
export function setupFetchMock() {
  global.fetch = jest.fn((url: string | URL | Request) => {
    const u = typeof url === "string" ? url : "";
    if (u.includes("/api/houses") && !u.includes("/")) return Promise.resolve({ ok: true, json: () => Promise.resolve([]) } as Response);
    if (u.includes("/api/actions")) return Promise.resolve({ ok: true, json: () => Promise.resolve([]) } as Response);
    if (u.includes("/api/activity")) return Promise.resolve({ ok: true, json: () => Promise.resolve([]) } as Response);
    if (u.includes("/api/profile")) return Promise.resolve({ ok: true, json: () => Promise.resolve(null) } as Response);
    if (u.includes("/api/mortgage")) return Promise.resolve({ ok: true, json: () => Promise.resolve([]) } as Response);
    if (u.includes("/api/calculator")) return Promise.resolve({ ok: true, json: () => Promise.resolve({ maxPropertyPrice: 500000, maxLTI: 450000 }) } as Response);
    if (u.includes("/api/schemes")) return Promise.resolve({ ok: true, json: () => Promise.resolve({ htb: { eligible: true, reason: "Eligible", maxRefund: 30000 }, fhs: { eligible: false, reason: "N/A", maxEquity: 0 }, lahl: { eligible: false, reason: "N/A", maxLoan: 0 } }) } as Response);
    if (u.includes("/api/journal")) return Promise.resolve({ ok: true, json: () => Promise.resolve([]) } as Response);
    return Promise.resolve({ ok: true, json: () => Promise.resolve([]) } as Response);
  }) as jest.Mock;
}
