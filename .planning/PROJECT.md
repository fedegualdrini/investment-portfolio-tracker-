# Project: Investment Portfolio Tracker

**Created:** 2026-02-05

## What This Is

A modern React-based web application for tracking and analyzing investment portfolios. Users can manage stocks, bonds, ETFs, and crypto with AI-powered insights, real-time prices, and visualization tools.

## Core Value

Complete portfolio management in one place - track investments, get AI analysis, visualize performance, all without data leaving the device.

## Problem Statement

Managing diverse investments (stocks, bonds, crypto) requires multiple tools:
- Spreadsheets for tracking (manual, error-prone)
- Different apps for each asset type (fragmented view)
- No unified analysis across asset classes
- Privacy concerns with cloud-based portfolio tools

## Solution

Single-page application with:
- Local-first storage (privacy)
- Multi-asset support (stocks, bonds, ETFs, crypto, cash)
- AI chat assistant for portfolio guidance
- Real-time price fetching
- Portfolio performance visualization
- Currency support (USD + ARS)

## Key Features (Currently Implemented)

### ✓ Core Features
- Add/edit/delete investments
- Real-time price updates (Yahoo Finance + CoinGecko)
- Portfolio summary (total value, gains/losses)
- AI chat assistant with portfolio tools
- Bond analysis with payment schedules
- Performance comparison vs benchmarks
- Dark/light theme
- Multi-currency (USD/ARS)
- Data export/import

## Architecture Overview

**Stack:** React 18 + TypeScript + Vite + Tailwind
**State:** React Context + localStorage
**AI:** Vercel AI Gateway + GPT-4o-mini
**Deployment:** Vercel (serverless functions)
**Data:** Privacy-first (all local)

---

## Next: Feature Brainstorming

Current maturity: **v1 functional**, ready for v2 enhancements.

Potential areas to explore:
- Advanced analytics and insights
- Historical performance tracking
- Portfolio rebalancing suggestions
- Dividend tracking
- Tax reporting
- Multi-portfolio support
- Mobile app

---
*Last updated: 2026-02-05*
