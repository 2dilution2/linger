import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import config from '../config/config.js';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'linger server',
      version: '1.0.0',
      description: '시가 머무는 순간 API 문서',
    },
    servers: [
      {
        url: `http://localhost:${config.server.port}`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        apiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-Linger-Api-Key',
          description: 'API 인증 필요시 사용',
        },
      },
    },
  },
  apis: ['./routes/*.js'], // userRoutes.js 등 주석 읽을 경로
};

const swaggerSpec = swaggerJSDoc(options);

export { swaggerSpec, swaggerUi };
