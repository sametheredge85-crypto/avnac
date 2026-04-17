import { z } from "zod";

const gradientStopSchema = z.object({
  color: z.string(),
  offset: z.number(),
});

const bgValueSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("solid"),
    color: z.string(),
  }),
  z.object({
    type: z.literal("gradient"),
    css: z.string(),
    stops: z.array(gradientStopSchema),
    angle: z.number(),
  }),
]);

export const avnacDocumentSchema = z.object({
  v: z.literal(1),
  artboard: z.object({
    width: z.number(),
    height: z.number(),
  }),
  bg: bgValueSchema,
  fabric: z.record(z.string(), z.unknown()),
});

const vectorPenAnchorSchema = z.object({
  x: z.number(),
  y: z.number(),
  inX: z.number().optional(),
  inY: z.number().optional(),
  outX: z.number().optional(),
  outY: z.number().optional(),
});

const vectorStrokeSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(["pen", "line", "rect", "ellipse", "arrow", "polygon"]),
  points: z.array(z.tuple([z.number(), z.number()])),
  penAnchors: z.array(vectorPenAnchorSchema).optional(),
  penClosed: z.boolean().optional(),
  stroke: z.string(),
  strokeWidthN: z.number(),
  fill: z.string(),
});

const vectorBoardLayerSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  visible: z.boolean(),
  strokes: z.array(vectorStrokeSchema),
});

const vectorBoardDocumentV2Schema = z.object({
  v: z.literal(2),
  layers: z.array(vectorBoardLayerSchema),
  activeLayerId: z.string().min(1),
});

const vectorBoardDocumentV1Schema = z.object({
  v: z.literal(1),
  strokes: z.array(
    z.object({
      id: z.string().min(1),
      points: z.array(z.tuple([z.number(), z.number()])),
      stroke: z.string(),
      strokeWidthN: z.number(),
    }),
  ),
});

export const vectorBoardDocumentSchema = z.union([
  vectorBoardDocumentV2Schema,
  vectorBoardDocumentV1Schema,
]);

export const vectorBoardMetaSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  createdAt: z.number().int(),
});

export const documentPayloadSchema = z.object({
  document: avnacDocumentSchema,
  vectorBoards: z.array(vectorBoardMetaSchema),
  vectorBoardDocs: z.record(z.string(), vectorBoardDocumentSchema),
});

export type DocumentPayload = z.infer<typeof documentPayloadSchema>;
