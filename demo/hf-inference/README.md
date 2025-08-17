---
title: demo/hf-inference/readme
group: demo/hf-inference
---

# HuggingFace Inference

Cost-effective integration with HuggingFace Inference API for accessing OpenAI gpt-oss-120b model.

## Purpose

Demonstrates capabilities:
- HuggingFace Inference API integration
- Using OpenAI-compatible models with significant cost savings
- Cost-effective solutions for AI applications (~$15/month vs $100/month for grok-3-mini)
- Seamless transition from expensive to affordable AI providers

## Key Features

- **HuggingFace Integration**: Access to gpt-oss-120b through HF API
- **OpenAI Compatibility**: Full compatibility with OpenAI chat completion format
- **Tool Calling Support**: Support for functions and tools
- **Cost Optimization**: Significant AI cost reduction
- **Production Ready**: Ready for production use

## Technology Stack

- **Runtime**: Bun
- **Language**: TypeScript
- **AI Framework**: agent-swarm-kit
- **Model**: OpenAI gpt-oss-120b via HuggingFace
- **SDK**: @huggingface/inference

## Project Structure

```
src/
├── logic/
│   ├── agent/         # Triage agent for pharma sales
│   ├── completion/    # HuggingFace completion provider
│   ├── enum/          # Enumerations
│   ├── swarm/         # Root swarm configuration
│   └── tools/         # Add to cart tool
└── index.ts           # Entry point
```

## Installation and Setup

```bash
# Install dependencies
bun install

# Run
bun run src/index.ts
```

## Configuration

Create a `.env` file:

```env
HF_API_KEY=your_huggingface_api_key
```

## Usage Examples

1. **Pharma Consultation**: "Recommend medicine for headache"
2. **Add to Cart**: "Add aspirin to cart"
3. **General Questions**: "What vitamins do you have?"
4. **Product Search**: "What helps with cold?"

## Economic Benefits

- **Dramatic Cost Reduction**: $15/month vs $100/month
- **Quality Preservation**: OpenAI-level model quality
- **No Vendor Lock-in**: Easy transition between providers
- **Scalable Pricing**: Pay only for usage

## Provider Comparison

| Provider | Model | Price/month | Quality |
|----------|-------|-------------|----------|
| xAI | grok-3-mini | ~$100 | High |
| HuggingFace | gpt-oss-120b | ~$15 | Comparable |
| **Savings** | | **85%** | **No Loss** |

## Applications

Perfect for:
- Startups with limited budget
- MVP and prototype development
- Cost-sensitive production systems
- AI experiments without high costs

## Migration Guide

To migrate from OpenAI/xAI:
1. Replace completion provider with HfCompletion
2. Update API keys in environment
3. No changes required in agent logic