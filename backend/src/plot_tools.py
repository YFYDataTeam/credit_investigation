import matplotlib
matplotlib.use('AGG')
import matplotlib.pyplot as plt
import io



plt.rcParams['font.sans-serif'] = ['Microsoft JhengHei'] 
plt.rcParams['axes.unicode_minus'] = False




def cat_value_count_bar_plot(df, column, color, title, xlabel, y_label):
    # Calculate the distribution of 'is_improve'
    distribution = df[column].value_counts()

    # Create a bar plot
    plt.figure(figsize=(6, 4))
    bars = distribution.plot(kind='bar', color=color)

    # Add annotations to each bar
    for i, count in enumerate(distribution):
        plt.text(i, count + 0.1, str(count), ha='center')


    plt.title(title)
    plt.xlabel(xlabel)
    plt.ylabel(y_label)
    plt.xticks(rotation=0)
    plt.grid(axis='y', linestyle='--', alpha=0.9)
    plt.tight_layout()

    img_buf = io.BytesIO()
    plt.savefig(img_buf, format='png')
    img_buf.seek(0)
    plt.close('all')

    return img_buf


def num_value_count_bar_plot(df, column, color, title, xlabel, ylabel):
    df[column] = df[column].astype('int')
    distribution = df[column].sort_values().value_counts(sort=False)  # Sort the values by index

    # Create a bar plot
    plt.figure(figsize=(6, 4))  # Adjust figure size as needed
    bars = distribution.plot(kind='bar', color=color)

    # Add annotations to each bar
    for i, count in enumerate(distribution):
        plt.text(i, count + 0.1, str(count), ha='center')

    plt.title(title)
    plt.xlabel(xlabel)
    plt.ylabel(ylabel)
    plt.xticks(rotation=45)  # Rotate x-axis labels for better visibility
    plt.grid(axis='y', linestyle='--', alpha=0.9)
    plt.tight_layout()
    # plt.show()

    img_buf = io.BytesIO()
    plt.savefig(img_buf, format='png')
    img_buf.seek(0)
    plt.close('all')

    return img_buf



def portion_pie_plot(df, target_column, title):
    type_counts = {type: df[target_column].count() for type in set(df[target_column])}

    labels = type_counts.keys()
    sizes = type_counts.values()

    plt.figure(figsize=(8, 6))
    plt.pie(sizes, labels=labels, autopct='%1.1f%%', startangle=90)
    plt.axis('equal')  # Equal aspect ratio ensures that pie is drawn as a circle.

    plt.title(title)
    # plt.show()

    img_buf = io.BytesIO()
    plt.savefig(img_buf, format='png')
    img_buf.seek(0)
    plt.close('all')

    return img_buf