from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('accounts', '0001_initial'),
        ('bookings', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='WorkspaceMetric',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField()),
                ('total_bookings', models.IntegerField(default=0)),
                ('total_hours_booked', models.FloatField(default=0.0)),
                ('occupancy_rate', models.FloatField(default=0.0)),
                ('workspace', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='metrics', to='bookings.workspace')),
            ],
            options={
                'unique_together': {('workspace', 'date')},
            },
        ),
        migrations.CreateModel(
            name='UserAnalytic',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('month', models.DateField()),
                ('total_bookings', models.IntegerField(default=0)),
                ('total_hours', models.FloatField(default=0.0)),
                ('most_booked_workspace', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='user_favorites', to='bookings.workspace')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='analytics', to='accounts.user')),
            ],
            options={
                'unique_together': {('user', 'month')},
            },
        ),
    ]