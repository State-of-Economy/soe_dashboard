export type Tier = "supporter" | "owner";

export interface DiscordUser {
  id: string;
  username: string;
  avatar?: string;
}

export interface AuthExchangeResponse {
  token: string;
  tier: Tier;
  expiresAt: number;
  discordUser: DiscordUser;
}

export interface AuthMeResponse {
  tier: Tier;
  discordUser: DiscordUser;
}

export interface PlayerSummary {
  citizenid: string;
  name: string;
  charinfo: { firstname?: string; lastname?: string; phone?: string };
  money: Record<string, number>;
  job?: { name: string; label: string; grade?: { name: string; level: number } };
  online: boolean;
}

export interface Vehicle {
  plate: string;
  vehicle: string;
  garage: string | null;
  state: number;
  fuel: number;
  engine: number;
  body: number;
}

export interface SpawnTarget {
  x: number;
  y: number;
  z: number;
  w: number;
}

export interface RoleMapping {
  id?: number;
  discordRoleId: string;
  tier: Tier;
  label?: string;
}

export interface AuditLogEntry {
  id: number;
  actorTag: string;
  action: string;
  targetCitizenid: string | null;
  targetPlate: string | null;
  details: string | null;
  createdAt: string;
}

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export class ApiClient {
  constructor(
    private baseUrl: string,
    private token: string | null,
  ) {}

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    const headers: Record<string, string> = {};
    if (this.token) headers["Authorization"] = `Bearer ${this.token}`;
    if (body !== undefined) headers["Content-Type"] = "application/json";

    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    let data: unknown = null;
    const text = await res.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    if (!res.ok) {
      const message =
        data && typeof data === "object" && "error" in (data as object)
          ? String((data as { error: unknown }).error)
          : `HTTP ${res.status}`;
      throw new ApiError(res.status, message);
    }

    return data as T;
  }

  health() {
    return this.request<{ ok: boolean; version: string }>("GET", "/health");
  }

  authExchange(code: string, redirectUri: string) {
    return this.request<AuthExchangeResponse>("POST", "/auth/exchange", {
      code,
      redirectUri,
    });
  }

  authMe() {
    return this.request<AuthMeResponse>("GET", "/auth/me");
  }

  authLogout() {
    return this.request<void>("POST", "/auth/logout");
  }

  searchPlayersByCitizenId(citizenid: string) {
    return this.request<{ results: PlayerSummary[] }>(
      "GET",
      `/players/search?citizenid=${encodeURIComponent(citizenid)}`,
    );
  }

  searchPlayersByName(name: string) {
    return this.request<{ results: PlayerSummary[] }>(
      "GET",
      `/players/search?name=${encodeURIComponent(name)}`,
    );
  }

  getPlayer(citizenid: string) {
    return this.request<PlayerSummary>(
      "GET",
      `/players/${encodeURIComponent(citizenid)}`,
    );
  }

  getPlayerVehicles(citizenid: string) {
    return this.request<{ vehicles: Vehicle[] }>(
      "GET",
      `/players/${encodeURIComponent(citizenid)}/vehicles`,
    );
  }

  resetSpawn(citizenid: string) {
    return this.request<{ success: boolean }>(
      "POST",
      `/players/${encodeURIComponent(citizenid)}/reset-spawn`,
      {},
    );
  }

  forcePark(plate: string) {
    return this.request<{ success: boolean }>(
      "POST",
      `/vehicles/${encodeURIComponent(plate)}/force-park`,
      {},
    );
  }

  getSpawnTarget() {
    return this.request<SpawnTarget>("GET", "/settings/spawn-target");
  }

  updateSpawnTarget(target: SpawnTarget) {
    return this.request<{ success: boolean }>(
      "PUT",
      "/settings/spawn-target",
      target,
    );
  }

  getRoles() {
    return this.request<{ roles: RoleMapping[] }>("GET", "/settings/roles");
  }

  updateRoles(roles: RoleMapping[]) {
    return this.request<{ success: boolean }>("PUT", "/settings/roles", {
      roles,
    });
  }

  getAuditLog(page = 1, pageSize = 50) {
    return this.request<{ entries: AuditLogEntry[]; total: number }>(
      "GET",
      `/audit/log?page=${page}&pageSize=${pageSize}`,
    );
  }
}
