import { SwaggerUiOptions } from 'swagger-ui-express';

declare module 'swagger-ui-express' {
  interface SwaggerUiOptions {
    explorer?: boolean;
    swaggerOptions?: any;
    customCss?: string;
    customfavIcon?: string;
    swaggerUrl?: string;
    customSiteTitle?: string;
  }
}
