import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  createRoom,
  getRoomByCode,
  getRoomById,
  addRoomMember,
  getRoomMembers,
  updateUserLocation,
  getRoomLocations,
  addCraving,
  getRoomCravings,
  deleteCraving,
  getRoomSearchResults,
} from "../db";

function generateRoomCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const roomsRouter = router({
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1).max(255) }))
    .mutation(async ({ ctx, input }) => {
      const code = generateRoomCode();
      const result = await createRoom(input.name, ctx.user.id, code);
      
      const roomId = (result as any)[0]?.id || Math.floor(Math.random() * 1000000);
      await addRoomMember(roomId, ctx.user.id);
      
      return {
        id: roomId,
        code,
        name: input.name,
        createdById: ctx.user.id,
      };
    }),

  join: protectedProcedure
    .input(z.object({ code: z.string().length(6).toUpperCase() }))
    .mutation(async ({ ctx, input }) => {
      const room = await getRoomByCode(input.code);
      if (!room) {
        throw new Error("Room not found");
      }

      const members = await getRoomMembers(room.id);
      const isAlreadyMember = members.some((m) => m.userId === ctx.user.id);
      
      if (!isAlreadyMember) {
        await addRoomMember(room.id, ctx.user.id);
      }

      return room;
    }),

  get: protectedProcedure
    .input(z.object({ roomId: z.number() }))
    .query(async ({ ctx, input }) => {
      const room = await getRoomById(input.roomId);
      if (!room) {
        throw new Error("Room not found");
      }

      const members = await getRoomMembers(room.id);
      const isMember = members.some((m) => m.userId === ctx.user.id);
      if (!isMember) {
        throw new Error("Not a member of this room");
      }

      return room;
    }),

  getMembers: protectedProcedure
    .input(z.object({ roomId: z.number() }))
    .query(async ({ ctx, input }) => {
      const members = await getRoomMembers(input.roomId);
      return members;
    }),

  updateLocation: protectedProcedure
    .input(
      z.object({
        roomId: z.number(),
        latitude: z.string(),
        longitude: z.string(),
        address: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await updateUserLocation(
        ctx.user.id,
        input.roomId,
        input.latitude,
        input.longitude,
        input.address
      );
      return { success: true };
    }),

  getLocations: protectedProcedure
    .input(z.object({ roomId: z.number() }))
    .query(async ({ ctx, input }) => {
      const locations = await getRoomLocations(input.roomId);
      return locations;
    }),

  addCraving: protectedProcedure
    .input(z.object({ roomId: z.number(), craving: z.string().min(1).max(255) }))
    .mutation(async ({ ctx, input }) => {
      const result = await addCraving(input.roomId, ctx.user.id, input.craving);
      return { success: true, id: (result as any).insertId };
    }),

  getCravings: protectedProcedure
    .input(z.object({ roomId: z.number() }))
    .query(async ({ ctx, input }) => {
      const cravings = await getRoomCravings(input.roomId);
      return cravings;
    }),

  removeCraving: protectedProcedure
    .input(z.object({ cravingId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await deleteCraving(input.cravingId);
      return { success: true };
    }),

  getSearchResults: protectedProcedure
    .input(z.object({ roomId: z.number() }))
    .query(async ({ ctx, input }) => {
      const results = await getRoomSearchResults(input.roomId);
      return results;
    }),
});
