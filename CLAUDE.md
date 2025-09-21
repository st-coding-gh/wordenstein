# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Wordenstein is a Next.js vocabulary learning application that helps users learn English words through AI-generated cards and training sessions. The app uses OpenAI's GPT for generating word cards with definitions, comparisons, and examples, and includes a spaced repetition training system.

## Architecture

### Database Layer

- **Technology**: SQLite with Prisma ORM
- **Schema**: `database/schema.prisma`
- **Key Models**:
  - `Card`: Vocabulary cards with GPT-generated content (word, definition, examples, etc.)
  - `User`: Authentication system with session management
  - `Vocabulary`: Oxford 3000 word list and user-specific vocabulary tracking
  - `WordsUnknown`/`WordsPossiblyUnknown`/`WordsIgnored`: Vocabulary classification system
  - `CardsGenerationLog`: Tracks bulk card generation processes

### Frontend Structure

- **Framework**: Next.js 15 with React 19
- **UI Library**: Ant Design with custom theming
- **Styling**: Tailwind CSS
- **Layout**: Consistent layout with auth wrapper and navigation header

### API Layer

- **Authentication**: Custom session-based auth (`/api/auth/*`)
- **Cards Management**: CRUD operations for vocabulary cards (`/api/card/*`)
- **Training System**: Spaced repetition training endpoints (`/api/training/*`)
- **Vocabulary Processing**: Text analysis and unknown word detection (`/api/vocabular/*`)
- **OpenAI Integration**: GPT-powered card generation (`/api/gpt/*`)

### Key Features

1. **Card Generation**: Uses OpenAI to generate comprehensive vocabulary cards with:

   - Definitions and translations
   - Usage comparisons with similar words
   - Best/worst usage examples
   - Image generation prompts

2. **Vocabulary Analysis**: Processes text input to identify unknown words against the Oxford 3000 word list

3. **Training System**: Spaced repetition learning with correct/incorrect answer tracking

4. **Bulk Operations**: Background processing for generating multiple cards with progress tracking

## Important Files

- `src/services/gpt/word-card-prompt.tsx`: Contains the GPT prompt template for generating vocabulary cards
- `src/data/data-manager.ts`: Global state management system
- `src/types/card.tsx`: Core card type definitions
- `database/schema.prisma`: Database schema with all models

## Database Setup

The project uses SQLite with Prisma. Database URL is configured via environment variable:

```
DATABASE_URL="file:./prod.db"
```

## Environment Configuration

Required environment variables:

- `DATABASE_URL`: SQLite database file path
- OpenAI API configuration (for GPT integration)

## Development Notes

- The app includes authentication but uses a simple session system
- Images are stored in the `uploads/images/cards` directory
- Card generation can be resource-intensive due to OpenAI API calls
- Training uses a simple correct/incorrect scoring system
