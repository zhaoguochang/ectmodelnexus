import { DataModel } from '../types';

export const econometricsData: DataModel = {
  nodes: [
    {
      id: "GMM",
      label: "GMM",
      group: "general",
      description: "Generalized Method of Moments. The overarching framework for estimation where parameters are chosen to match population moments with sample moments.",
      math: "min g(θ)' W g(θ)",
      details: [
        "Requires specifying moment conditions E[m(data, θ)] = 0.",
        "Consistent if moments are valid.",
        "Efficient GMM uses the optimal weight matrix W = S⁻¹.",
        "Encompasses OLS, IV, MLE as special cases."
      ]
    },
    {
      id: "OLS",
      label: "OLS",
      group: "base",
      description: "Ordinary Least Squares. The standard linear regression estimator minimizing the sum of squared residuals.",
      math: "β = (X'X)⁻¹ X'y",
      details: [
        "Base model for linear relationships.",
        "Assumes strict exogeneity E[ε|X] = 0.",
        "Assumes spherical errors (Homoskedasticity & No Autocorrelation) for efficiency.",
        "BLUE (Best Linear Unbiased Estimator) under Gauss-Markov assumptions."
      ]
    },
    {
      id: "GLS",
      label: "GLS/WLS",
      group: "extension",
      description: "Generalized Least Squares. Extends OLS to handle non-spherical errors (Heteroskedasticity or Serial Correlation).",
      math: "β = (X'Ω⁻¹X)⁻¹ X'Ω⁻¹y",
      details: [
        "Used when Var(ε|X) = Ω ≠ σ²I.",
        "Transforms data to restore homoskedasticity.",
        "WLS (Weighted Least Squares) is a specific case for heteroskedasticity.",
        "If Ω is unknown, we use FGLS (Feasible GLS)."
      ]
    },
    {
      id: "IV",
      label: "IV / 2SLS",
      group: "extension",
      description: "Instrumental Variables. Handles endogeneity where regressors are correlated with the error term.",
      math: "β = (X'P_z X)⁻¹ X'P_z y",
      details: [
        "Solves E[X'ε] ≠ 0 (Endogeneity).",
        "Uses Instruments Z correlated with X but uncorrelated with ε.",
        "2SLS: 1. Regress X on Z to get X̂. 2. Regress Y on X̂.",
        "Trade-off: IV is less efficient than OLS but consistent under endogeneity."
      ]
    },
    {
      id: "FE",
      label: "Fixed Effects",
      group: "panel",
      description: "Panel data estimator controlling for time-invariant unobserved heterogeneity.",
      math: "(y_it - ȳ_i) = (x_it - x̄_i)β + (ε_it - ε̄_i)",
      details: [
        "Removes individual specific effects (α_i) via 'Within Transformation'.",
        "Consistent even if α_i is correlated with X.",
        "Cannot estimate coefficients for time-invariant variables.",
        "Equivalent to adding a dummy variable for each individual (LSDV)."
      ]
    },
    {
      id: "RE",
      label: "Random Effects",
      group: "panel",
      description: "Panel data estimator assuming unobserved heterogeneity is uncorrelated with regressors.",
      math: "(y_it - θȳ_i) ... Quasi-demeaning",
      details: [
        "More efficient than FE if assumption holds.",
        "Assumes Cov(α_i, X_it) = 0.",
        "Uses a partial transformation (Quasi-demeaning) based on the variance of α_i and ε_it.",
        "A special case of GLS."
      ]
    },
    {
      id: "DID",
      label: "DID",
      group: "causal",
      description: "Difference-in-Differences. Quasi-experimental design to estimate causal effects by comparing changes over time between treatment and control groups.",
      math: "y = β₀ + β₁T + β₂Post + β₃(T × Post) + ε",
      details: [
        "Key Assumption: Parallel Trends (in absence of treatment, groups would evolve similarly).",
        "Can be implemented via OLS with interaction terms.",
        "Can be implemented via FE (Two-way Fixed Effects) with unit and time fixed effects.",
        "Estimates the ATT (Average Treatment Effect on the Treated)."
      ]
    }
  ],
  links: [
    {
      source: "GMM",
      target: "OLS",
      relation: "Special Case",
      description: "OLS is GMM where the moment condition is orthogonality between regressors and errors.",
      assumptions: ["Moment: E[x'ε] = 0", "Weight Matrix: Identity (I)"],
      transformation: "None (Identity weighting)"
    },
    {
      source: "GMM",
      target: "IV",
      relation: "Special Case",
      description: "IV is GMM using instruments as the source of moment conditions.",
      assumptions: ["Moment: E[z'ε] = 0", "Weight Matrix: (Z'Z)⁻¹ (for 2SLS)"],
      transformation: "Projection of X onto Z"
    },
    {
      source: "GMM",
      target: "GLS",
      relation: "Special Case",
      description: "GLS is GMM applied to the transformed equation or utilizing the specific variance structure in the weighting.",
      assumptions: ["Moment: E[X'Ω⁻¹ε] = 0", "Weight Matrix: Ω⁻¹"],
      transformation: "Data transformed by Cholesky factor of Ω⁻¹"
    },
    {
      source: "OLS",
      target: "GLS",
      relation: "Extension",
      description: "GLS extends OLS by weighting observations based on their variance.",
      assumptions: ["Change: Relax Homoskedasticity", "Change: Relax No Serial Correlation"],
      transformation: "Multiply y and X by P where P'P = Ω⁻¹"
    },
    {
      source: "OLS",
      target: "IV",
      relation: "Extension",
      description: "IV extends OLS to handle endogenous variables by using external information (instruments).",
      assumptions: ["Change: Relax Strict Exogeneity (E[x'ε] ≠ 0)", "Add: Instrument Exogeneity (E[z'ε] = 0)", "Add: Instrument Relevance"],
      transformation: "Replace X with projected X̂ = Z(Z'Z)⁻¹Z'X"
    },
    {
      source: "OLS",
      target: "FE",
      relation: "Extension (Panel)",
      description: "FE adapts OLS for panel data to remove unobserved time-invariant confounders.",
      assumptions: ["Change: Allow Cov(α_i, X) ≠ 0", "Maintain: Strict Exogeneity of ε_it"],
      transformation: "Demeaning: x_it - x̄_i (Within Transformation)"
    },
    {
      source: "OLS",
      target: "RE",
      relation: "Extension (Panel)",
      description: "RE adapts OLS for panel data to gain efficiency when heterogeneity is random.",
      assumptions: ["Maintain: Cov(α_i, X) = 0", "Change: Errors have composite structure (α_i + ε_it)"],
      transformation: "Quasi-demeaning: x_it - θx̄_i"
    },
    {
      source: "OLS",
      target: "DID",
      relation: "Extension (Causal)",
      description: "DID uses OLS structure with specific dummy variables to isolate causal effects.",
      assumptions: ["Add: Parallel Trends Assumption", "Add: No spillover effects"],
      transformation: "Interaction terms: Treat × Post"
    },
    {
      source: "FE",
      target: "DID",
      relation: "Implementation",
      description: "DID is a research design (Identification Strategy), whereas FE is an estimation technique. DID is often implemented using a Two-Way Fixed Effects (TWFE) estimator.",
      assumptions: ["Requires: Parallel Trends (Design)", "Requires: Group and Time Fixed Effects"],
      transformation: "Unit FE + Time FE"
    },
    {
      source: "GLS",
      target: "RE",
      relation: "Equivalence",
      description: "Random Effects is mathematically a feasible GLS estimator on panel data.",
      assumptions: ["Structure: Block-diagonal Variance Covariance Matrix"],
      transformation: "GLS transformation using specific θ"
    }
  ]
};