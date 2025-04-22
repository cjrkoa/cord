#!/bin/bash 
#SBATCH --job-name=my_gpu_job   
#SBATCH --partition=gpu-h100   
#SBATCH --nodes=1   
#SBATCH --ntasks=1   
#SBATCH --cpus-per-task=32   
#SBATCH --gres=gpu:1   
#SBATCH --time=12:00:00 # Set desired wall time. Max runtime is 1 day for the h100 partition, 3 days for h100sxm. 
#SBATCH --output=slurm-%j.out   
#SBATCH --error=slurm-%j.err   
#SBATCH --mail-user=croddy@stevens.edu   
#SBATCH --mail-type=BEGIN,END,FAIL # Get email notifications for job start, end, and failure  
# Load any required modules  
module load cuda12.2 # Adjust as needed  
module load python39
# Activate virtual environment (if using one)  
source venv/bin/activate
# Run your GPU job  
srun ./train.py  