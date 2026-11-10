import { type APIRequestContext, expect } from '@playwright/test';
import { env } from '../config/env';
import { step } from '../utils/step';

/**
 * Thin client for Appian Web APIs (`/suite/webapi/<endpoint>`), used to create and
 * clean up test data for preconditions marked `setup: api` – much faster and more
 * stable than clicking through the UI.
 *
 * Requires an Appian service account API key in APPIAN_API_KEY (pipeline secret in CI).
 * Endpoints are app-specific: the methods below are EXAMPLES – replace with your Web APIs.
 */
export class AppianApi {
  constructor(private readonly request: APIRequestContext) {}

  private headers(): Record<string, string> {
    if (!env.apiKey) {
      throw new Error('APPIAN_API_KEY is not set – needed for API-based test-data setup.');
    }
    return { 'Appian-API-Key': env.apiKey, 'Content-Type': 'application/json' };
  }

  async post<T = unknown>(endpoint: string, body: unknown): Promise<T> {
    const res = await this.request.post(`/suite/webapi/${endpoint}`, { headers: this.headers(), data: body });
    expect(res, `POST ${endpoint} failed: ${res.status()}`).toBeOK();
    return (await res.json()) as T;
  }

  async delete(endpoint: string): Promise<void> {
    const res = await this.request.delete(`/suite/webapi/${endpoint}`, { headers: this.headers() });
    expect(res, `DELETE ${endpoint} failed: ${res.status()}`).toBeOK();
  }

  // ---- EXAMPLE domain helpers – adapt to your Web APIs ----

  async createExpense(data: { description: string; category: string; amount: string }): Promise<{ id: number }> {
    return step(`API: create expense "${data.description}"`, () => this.post<{ id: number }>('expenses', data));
  }

  async deleteExpense(id: number): Promise<void> {
    await step(`API: delete expense ${id}`, () => this.delete(`expenses/${id}`));
  }
}
