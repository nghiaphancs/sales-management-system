const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  private async request(path: string, options: RequestInit = {}) {
    const token = this.getToken();
    const headers: any = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    
    if (res.status === 401) {
      this.setToken(null);
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new Error('Unauthorized');
    }

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Request failed: ${res.status}`);
    }

    if (res.status === 204) return null;
    return res.json();
  }

  // Auth
  login(email: string, password: string) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  getMe() {
    return this.request('/api/auth/me');
  }

  // Dashboard
  getDashboard() {
    return this.request('/api/dashboard');
  }

  // Users
  getUsers(role?: string) {
    const q = role ? `?role=${role}` : '';
    return this.request(`/api/users${q}`);
  }

  getUser(id: string) {
    return this.request(`/api/users/${id}`);
  }

  registerUser(data: {
    email: string;
    password: string;
    name: string;
    role?: string;
    phone?: string;
    leaderId?: string;
  }) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Agencies
  getAgencies() {
    return this.request('/api/agencies');
  }

  getAgency(id: string) {
    return this.request(`/api/agencies/${id}`);
  }

  createAgency(data: any) {
    return this.request('/api/agencies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updateAgency(id: string, data: any) {
    return this.request(`/api/agencies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Orders
  getOrders() {
    return this.request('/api/orders');
  }

  getOrder(id: string) {
    return this.request(`/api/orders/${id}`);
  }

  createOrder(data: any) {
    return this.request('/api/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Products
  getProducts() {
    return this.request('/api/products');
  }

  createProduct(data: { sku: string; name: string; price: number }) {
    return this.request('/api/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Payments
  createPayment(data: any) {
    return this.request('/api/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  getPayments(agencyId: string) {
    return this.request(`/api/payments?agencyId=${agencyId}`);
  }
}

export const api = new ApiClient();
