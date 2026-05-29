import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

/**
 * Generate Swagger specification dynamically from JSDoc comments.
 * The spec is mounted under `/api-docs`.
 */
export const setupSwagger = (app: Express) => {
  const options = {
    definition: {
      openapi: '3.0.1',
      info: {
        title: 'Sales Management System API',
        version: '1.0.0',
        description: 'REST API for Sales Management System (PWA backend)',
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [{ bearerAuth: [] }],
      servers: [{ url: process.env.API_BASE_URL || 'http://localhost:3000' }],
    },
    // Paths to the API docs
    apis: ['src/controllers/**/*.ts', 'src/models/**/*.ts'],
  } as const;

  const swaggerSpec = swaggerJSDoc(options);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
