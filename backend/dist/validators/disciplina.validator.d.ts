import { z } from 'zod';
export declare const createDisciplinaSchema: z.ZodObject<{
    nombre: z.ZodString;
    precioMensual: z.ZodNumber;
}, z.core.$strip>;
export declare const updateDisciplinaSchema: z.ZodObject<{
    nombre: z.ZodOptional<z.ZodString>;
    precioMensual: z.ZodOptional<z.ZodNumber>;
    activa: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export type CreateDisciplinaInput = z.infer<typeof createDisciplinaSchema>;
export type UpdateDisciplinaInput = z.infer<typeof updateDisciplinaSchema>;
//# sourceMappingURL=disciplina.validator.d.ts.map