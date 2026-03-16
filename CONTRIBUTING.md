# Guía de Contribución

¡Gracias por tu interés en contribuir a Boka CR! Esta guía te ayudará a empezar.

## 🚀 Configuración del entorno de desarrollo

1. **Fork y clona el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/boka-app.git
   cd boka-app
   ```

2. **Sigue las instrucciones del README** para configurar el entorno local

3. **Crea una rama para tu feature**
   ```bash
   git checkout -b feature/nombre-descriptivo
   ```

## 📝 Estándares de código

### Estructura de commits
Usa commits descriptivos siguiendo el formato:
```
tipo(scope): descripción breve

Descripción más detallada si es necesario
```

Tipos válidos:
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Cambios de formato (no afectan funcionalidad)
- `refactor`: Refactorización de código
- `test`: Agregar o modificar tests
- `chore`: Tareas de mantenimiento

### Convenciones de código

**TypeScript/JavaScript:**
- Usar TypeScript estricto
- Preferir `const` sobre `let`
- Usar arrow functions cuando sea apropiado
- Nombres descriptivos para variables y funciones

**React/Next.js:**
- Componentes funcionales con hooks
- Props tipadas con interfaces
- Usar `use client` solo cuando sea necesario

**NestJS:**
- Decoradores apropiados (@Controller, @Service, etc.)
- DTOs para validación de entrada
- Manejo de errores consistente

## 🧪 Testing

Antes de enviar tu PR:

```bash
# Verificar que el proyecto compile
npm run build

# Ejecutar linting (si está configurado)
npm run lint

# Verificar que la base de datos funcione
npm run db:generate
```

## 📋 Proceso de Pull Request

1. **Asegúrate de que tu código funcione**
   - El proyecto debe compilar sin errores
   - Las migraciones deben ejecutarse correctamente
   - No debe haber errores de TypeScript

2. **Describe tu cambio**
   - Título claro y descriptivo
   - Descripción de qué problema resuelve
   - Screenshots si hay cambios visuales

3. **Mantén el PR enfocado**
   - Un PR por feature/fix
   - Cambios relacionados únicamente

## 🐛 Reportar bugs

Usa el template de issues para reportar bugs:

- **Descripción**: Qué esperabas vs qué pasó
- **Pasos para reproducir**: Lista detallada
- **Entorno**: OS, Node.js version, etc.
- **Screenshots**: Si aplica

## 💡 Sugerir features

Para nuevas funcionalidades:

- **Problema**: Qué problema resuelve
- **Solución propuesta**: Cómo lo resolverías
- **Alternativas**: Otras opciones consideradas
- **Contexto adicional**: Mockups, referencias, etc.

## 📚 Recursos útiles

- [Next.js Docs](https://nextjs.org/docs)
- [NestJS Docs](https://docs.nestjs.com/)
- [Prisma Docs](https://www.prisma.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## ❓ ¿Necesitas ayuda?

- Abre un issue con la etiqueta `question`
- Revisa issues existentes por si ya fue respondido
- Contacta a los maintainers

¡Gracias por contribuir! 🎉