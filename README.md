# PPI Builder Demo

A simplified public demo of an internal **Smart Indexes** data-processing tool used to calculate property-market indicators for Dubai.

**Live product powered by the production pipeline:**  
https://smartindexes.com/terminal/

**Methodology overview:**  
https://smartindexes.com/knowledge-base/property-price-indexes-api-methodology

## What this repository demonstrates

The demo shows the architecture of a typical market-data pipeline:

`Open data → validation → classification → aggregation → indicator calculation → JSON export`

It includes:

- CSV ingestion;
- deterministic validation;
- residential/commercial classification;
- sale/rent separation;
- monthly aggregation;
- minimum-sample control;
- median price-per-sqm calculation;
- structured JSON generation;
- a small browser UI for running and inspecting the pipeline.

## Methodology

The production version processes Dubai Land Department open data and applies the **Smart Indexes Property Price Indexes methodology**.

The production pipeline includes, among other stages:

- transaction and rental-data validation;
- property-type classification;
- geographic matching across communities, master projects and development projects;
- minimum-sample requirements;
- outlier control;
- time-series continuity rules;
- sale and rental-rate calculations;
- derived investment indicators;
- structured JSON generation for PPI Terminal.

This public repository intentionally does **not** reproduce the production methodology in full.

## Public-demo limitations

The following are intentionally excluded or replaced with simplified demo logic:

- production datasets and private/internal source URLs;
- production project/community matching maps;
- exact validation thresholds;
- production outlier rules;
- interpolation and carry-forward rules;
- investment-model coefficients;
- production Cap Rate logic;
- internal QA/control datasets;
- full production JSON schema;
- selected methodology and business rules.

The bundled CSV contains **synthetic sample data** and is not a Dubai Land Department dataset.

## Run locally

Because the demo loads a local CSV with `fetch`, run it through a local web server:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

Click **Load sample data** → **Run builder**.

## Input schema

```text
date,community,usage,deal,amount_aed,area_sqm
```

Allowed demo values:

- `usage`: `residential`, `commercial`
- `deal`: `sale`, `rent`

## Output example

```json
{
  "community": "Dubai Marina",
  "usage": "residential",
  "deal": "sale",
  "period": "2026-01",
  "observations": 3,
  "median_price_per_sqm_aed": 19891.3,
  "data_source": "observed"
}
```

## Why this demo exists

The goal is to demonstrate product thinking and data-pipeline implementation without publishing production calculation logic or proprietary methodology details.

The production version is used as part of the Smart Indexes analytics stack and feeds structured market indicators into PPI Terminal.
