#!/usr/bin/env python3
"""
Statistical Analysis for HRI Speed-Accuracy Tradeoff Study
Computes repeated measures ANOVAs, post-hoc tests, and descriptive statistics.
Exports results to JSON for web visualization.
"""

import pandas as pd
import numpy as np
from scipy import stats
import json
import warnings
warnings.filterwarnings('ignore')

# Try to import pingouin for repeated measures ANOVA
try:
    import pingouin as pg
    HAS_PINGOUIN = True
except ImportError:
    HAS_PINGOUIN = False
    print("Warning: pingouin not installed. Using simplified analysis.")

def load_data(filepath='01-Winterschool-Data.csv'):
    """Load and prepare the dataset."""
    df = pd.read_csv(filepath)
    
    # Rename columns for clarity
    df = df.rename(columns={
        'ConditionSAT': 'SAT',
        'ConditionTransparancy': 'Transparency',
        'ConditionUserDecision': 'UserDecision'
    })
    
    # Map condition values to clearer labels
    df['Transparency'] = df['Transparency'].map({'T': 'Yes', 'NT': 'No'})
    df['UserDecision'] = df['UserDecision'].map({'UD': 'Yes', 'NUD': 'No'})
    
    # Compute overall TLX score (raw average of 6 subscales)
    tlx_cols = ['TLX_Mental', 'TLX_Physical', 'TLX_Temporal', 
                'TLX_Performance', 'TLX_Effort', 'TLX_Frustration']
    df['TLX_Overall'] = df[tlx_cols].mean(axis=1)
    
    return df

def compute_descriptives(df, dv, groupby_cols):
    """Compute descriptive statistics for a DV grouped by conditions."""
    grouped = df.groupby(groupby_cols)[dv].agg(['mean', 'std', 'sem', 'count'])
    grouped['ci_95'] = grouped['sem'] * 1.96
    grouped = grouped.reset_index()
    return grouped

def compute_descriptives_dict(df, dv, groupby_cols):
    """Return descriptives as a nested dictionary."""
    grouped = compute_descriptives(df, dv, groupby_cols)
    result = {}
    for _, row in grouped.iterrows():
        key = '_'.join([str(row[col]) for col in groupby_cols])
        result[key] = {
            'mean': round(row['mean'], 3),
            'sd': round(row['std'], 3),
            'se': round(row['sem'], 3),
            'ci_95': round(row['ci_95'], 3),
            'n': int(row['count'])
        }
    return result

def run_rm_anova_1way(df, dv, within_factor, subject='PID'):
    """Run 1-way repeated measures ANOVA."""
    if not HAS_PINGOUIN:
        return None
    
    try:
        aov = pg.rm_anova(
            data=df,
            dv=dv,
            within=within_factor,
            subject=subject,
            correction=True
        )
        
        row = aov.iloc[0]
        # ng2 = generalized eta-squared (newer pingouin versions)
        eta_col = 'ng2' if 'ng2' in row else 'np2'
        return {
            'factor': within_factor,
            'df1': int(row['ddof1']),
            'df2': int(row['ddof2']),
            'F': round(row['F'], 3),
            'p': round(row['p-unc'], 4),
            'p_corr': round(row['p-GG-corr'], 4) if 'p-GG-corr' in row and pd.notna(row['p-GG-corr']) else round(row['p-unc'], 4),
            'eta_sq': round(row[eta_col], 3),
            'significant': row['p-unc'] < 0.05
        }
    except Exception as e:
        print(f"1-way ANOVA error for {dv} ~ {within_factor}: {e}")
        return None

def run_rm_anova_2way(df, dv, within_factors, subject='PID'):
    """Run 2-way repeated measures ANOVA."""
    if not HAS_PINGOUIN:
        return None
    
    try:
        aov = pg.rm_anova(
            data=df,
            dv=dv,
            within=within_factors,
            subject=subject,
            correction=True
        )
        
        # Determine eta-squared column name
        eta_col = 'ng2' if 'ng2' in aov.columns else 'np2'
        
        results = {}
        for _, row in aov.iterrows():
            source = row['Source']
            results[source] = {
                'df1': int(row['ddof1']),
                'df2': int(row['ddof2']),
                'F': round(row['F'], 3),
                'p': round(row['p-unc'], 4),
                'p_corr': round(row['p-GG-corr'], 4) if 'p-GG-corr' in row and pd.notna(row['p-GG-corr']) else round(row['p-unc'], 4),
                'eta_sq': round(row[eta_col], 3),
                'significant': row['p-unc'] < 0.05
            }
        return results
    except Exception as e:
        print(f"2-way ANOVA error for {dv} ~ {within_factors}: {e}")
        return None

def run_posthoc(df, dv, within_factor, subject='PID'):
    """Run post-hoc pairwise comparisons for a within-subjects factor."""
    if not HAS_PINGOUIN:
        return None
    
    try:
        posthoc = pg.pairwise_tests(
            data=df,
            dv=dv,
            within=within_factor,
            subject=subject,
            padjust='bonf'
        )
        
        results = []
        for _, row in posthoc.iterrows():
            results.append({
                'contrast': f"{row['A']} vs {row['B']}",
                'A': str(row['A']),
                'B': str(row['B']),
                't': round(row['T'], 3),
                'df': int(row['dof']),
                'p': round(row['p-unc'], 4),
                'p_adj': round(row['p-corr'], 4) if pd.notna(row['p-corr']) else round(row['p-unc'], 4),
                'd': round(row['hedges'], 3) if 'hedges' in row and pd.notna(row['hedges']) else None,
                'significant': (row['p-corr'] < 0.05) if pd.notna(row['p-corr']) else (row['p-unc'] < 0.05)
            })
        return results
    except Exception as e:
        print(f"Post-hoc error for {dv} ~ {within_factor}: {e}")
        return None

def analyze_dv(df, dv, dv_label):
    """Run complete analysis for a single DV."""
    print(f"Analyzing: {dv_label}")
    
    result = {
        'label': dv_label,
        'variable': dv
    }
    
    # Descriptive statistics by each factor
    result['descriptives_SAT'] = compute_descriptives_dict(df, dv, ['SAT'])
    result['descriptives_Transparency'] = compute_descriptives_dict(df, dv, ['Transparency'])
    result['descriptives_UserDecision'] = compute_descriptives_dict(df, dv, ['UserDecision'])
    
    # Descriptives by two-factor combinations
    result['descriptives_SAT_Transparency'] = compute_descriptives_dict(df, dv, ['SAT', 'Transparency'])
    result['descriptives_SAT_UserDecision'] = compute_descriptives_dict(df, dv, ['SAT', 'UserDecision'])
    result['descriptives_Transparency_UserDecision'] = compute_descriptives_dict(df, dv, ['Transparency', 'UserDecision'])
    
    # Descriptives by all factors
    result['descriptives_all'] = compute_descriptives_dict(df, dv, ['SAT', 'Transparency', 'UserDecision'])
    
    # One-way RM ANOVAs for each main effect
    result['anova_SAT'] = run_rm_anova_1way(df, dv, 'SAT')
    result['anova_Transparency'] = run_rm_anova_1way(df, dv, 'Transparency')
    result['anova_UserDecision'] = run_rm_anova_1way(df, dv, 'UserDecision')
    
    # Two-way RM ANOVAs for interactions
    result['anova_SAT_Transparency'] = run_rm_anova_2way(df, dv, ['SAT', 'Transparency'])
    result['anova_SAT_UserDecision'] = run_rm_anova_2way(df, dv, ['SAT', 'UserDecision'])
    
    # Post-hoc tests for SAT (the main factor of interest)
    result['posthoc_SAT'] = run_posthoc(df, dv, 'SAT')
    
    return result

def generate_summary(results):
    """Generate a summary of key findings."""
    summary = {
        'significant_effects': [],
        'key_patterns': []
    }
    
    for dv, analysis in results['analyses'].items():
        label = analysis['label']
        
        # Check main effect of SAT
        if analysis.get('anova_SAT') and analysis['anova_SAT'].get('significant'):
            effect = analysis['anova_SAT']
            summary['significant_effects'].append({
                'dv': label,
                'effect': 'SAT (main effect)',
                'F': effect['F'],
                'p': effect['p'],
                'eta_sq': effect['eta_sq']
            })
        
        # Check main effect of Transparency
        if analysis.get('anova_Transparency') and analysis['anova_Transparency'].get('significant'):
            effect = analysis['anova_Transparency']
            summary['significant_effects'].append({
                'dv': label,
                'effect': 'Uncertainty Communication (main effect)',
                'F': effect['F'],
                'p': effect['p'],
                'eta_sq': effect['eta_sq']
            })
        
        # Check main effect of UserDecision
        if analysis.get('anova_UserDecision') and analysis['anova_UserDecision'].get('significant'):
            effect = analysis['anova_UserDecision']
            summary['significant_effects'].append({
                'dv': label,
                'effect': 'User Decision (main effect)',
                'F': effect['F'],
                'p': effect['p'],
                'eta_sq': effect['eta_sq']
            })
        
        # Check SAT x Transparency interaction
        sat_trans = analysis.get('anova_SAT_Transparency')
        if sat_trans and 'SAT * Transparency' in sat_trans:
            interaction = sat_trans['SAT * Transparency']
            if interaction.get('significant'):
                summary['significant_effects'].append({
                    'dv': label,
                    'effect': 'SAT × Uncertainty Communication',
                    'F': interaction['F'],
                    'p': interaction['p'],
                    'eta_sq': interaction['eta_sq']
                })
        
        # Check SAT x UserDecision interaction
        sat_ud = analysis.get('anova_SAT_UserDecision')
        if sat_ud and 'SAT * UserDecision' in sat_ud:
            interaction = sat_ud['SAT * UserDecision']
            if interaction.get('significant'):
                summary['significant_effects'].append({
                    'dv': label,
                    'effect': 'SAT × User Decision',
                    'F': interaction['F'],
                    'p': interaction['p'],
                    'eta_sq': interaction['eta_sq']
                })
    
    return summary

def main():
    """Main analysis pipeline."""
    print("=" * 60)
    print("HRI Study Statistical Analysis")
    print("=" * 60)
    
    # Load data
    df = load_data()
    print(f"\nLoaded {len(df)} observations from {df['PID'].nunique()} participants")
    print(f"Conditions: SAT({list(df['SAT'].unique())}), Transparency({list(df['Transparency'].unique())}), UserDecision({list(df['UserDecision'].unique())})")
    
    # Define DVs to analyze
    dvs = [
        ('FrustrationRobotPerformance', 'Frustration: Robot Performance'),
        ('FrustrationRobotDecision', 'Frustration: Robot Decisions'),
        ('TLX_Overall', 'NASA TLX Overall'),
        ('TLX_Mental', 'NASA TLX: Mental Demand'),
        ('TLX_Physical', 'NASA TLX: Physical Demand'),
        ('TLX_Temporal', 'NASA TLX: Temporal Demand'),
        ('TLX_Performance', 'NASA TLX: Performance'),
        ('TLX_Effort', 'NASA TLX: Effort'),
        ('TLX_Frustration', 'NASA TLX: Frustration'),
        ('Utility_Score', 'Perceived Utility'),
        ('Godspeed_Intelligence', 'Perceived Intelligence')
    ]
    
    # Run analysis for each DV
    results = {
        'study_info': {
            'design': '3 (SAT) × 2 (Uncertainty Communication) × 2 (User Decision) within-subjects',
            'n_participants': int(df['PID'].nunique()),
            'n_observations': len(df),
            'factors': {
                'SAT': ['Conservative', 'Moderate', 'Risky'],
                'Transparency': ['Yes', 'No'],
                'UserDecision': ['Yes', 'No']
            },
            'dv_scales': {
                'FrustrationRobotPerformance': {'min': 1, 'max': 7, 'label': '7-point Likert'},
                'FrustrationRobotDecision': {'min': 1, 'max': 7, 'label': '7-point Likert'},
                'TLX_Overall': {'min': 1, 'max': 21, 'label': '21-point scale'},
                'TLX_Mental': {'min': 1, 'max': 21, 'label': '21-point scale'},
                'TLX_Physical': {'min': 1, 'max': 21, 'label': '21-point scale'},
                'TLX_Temporal': {'min': 1, 'max': 21, 'label': '21-point scale'},
                'TLX_Performance': {'min': 1, 'max': 21, 'label': '21-point scale'},
                'TLX_Effort': {'min': 1, 'max': 21, 'label': '21-point scale'},
                'TLX_Frustration': {'min': 1, 'max': 21, 'label': '21-point scale'},
                'Utility_Score': {'min': 1, 'max': 4, 'label': 'Composite score'},
                'Godspeed_Intelligence': {'min': 1, 'max': 5, 'label': 'Godspeed scale'}
            }
        },
        'analyses': {}
    }
    
    for dv, label in dvs:
        results['analyses'][dv] = analyze_dv(df, dv, label)
    
    # Generate summary of findings
    results['summary'] = generate_summary(results)
    
    # Export to JSON (convert numpy types to native Python types)
    def convert_numpy(obj):
        if isinstance(obj, dict):
            return {k: convert_numpy(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [convert_numpy(i) for i in obj]
        elif isinstance(obj, (np.bool_, np.integer)):
            return int(obj)
        elif isinstance(obj, np.floating):
            return float(obj)
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        else:
            return obj
    
    results = convert_numpy(results)
    
    output_file = 'results_data.json'
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n{'=' * 60}")
    print(f"Results exported to: {output_file}")
    print(f"Found {len(results['summary']['significant_effects'])} significant effects")
    print("=" * 60)
    
    return results

if __name__ == '__main__':
    main()
