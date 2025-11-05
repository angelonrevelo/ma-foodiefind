import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, rooms, roomMembers, userLocations, cravings, searchResults, InsertSearchResult } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Room queries
export async function createRoom(name: string, createdById: number, code: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(rooms).values({
    name,
    createdById,
    code,
  });
  
  return result;
}

export async function getRoomByCode(code: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(rooms).where(eq(rooms.code, code)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getRoomById(roomId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(rooms).where(eq(rooms.id, roomId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Room member queries
export async function addRoomMember(roomId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(roomMembers).values({ roomId, userId });
}

export async function getRoomMembers(roomId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(roomMembers).where(eq(roomMembers.roomId, roomId));
}

// Location queries
export async function updateUserLocation(userId: number, roomId: number, latitude: string, longitude: string, address?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await db.select().from(userLocations).where(
    and(eq(userLocations.userId, userId), eq(userLocations.roomId, roomId))
  ).limit(1);
  
  if (existing.length > 0) {
    return db.update(userLocations).set({ latitude, longitude, address }).where(
      and(eq(userLocations.userId, userId), eq(userLocations.roomId, roomId))
    );
  } else {
    return db.insert(userLocations).values({ userId, roomId, latitude, longitude, address });
  }
}

export async function getRoomLocations(roomId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(userLocations).where(eq(userLocations.roomId, roomId));
}

// Craving queries
export async function addCraving(roomId: number, userId: number, craving: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(cravings).values({ roomId, userId, craving });
}

export async function getRoomCravings(roomId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(cravings).where(eq(cravings.roomId, roomId));
}

export async function deleteCraving(cravingId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(cravings).where(eq(cravings.id, cravingId));
}

// Search results queries
export async function saveSearchResult(data: InsertSearchResult) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(searchResults).values(data);
}

export async function getRoomSearchResults(roomId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(searchResults).where(eq(searchResults.roomId, roomId));
}
